#include "search.h"

#include <algorithm>
#include <chrono>
#include <cmath>
#include <cstring>
#include <iostream>

#include "nnue.h"

namespace tk {

TranspositionTable TT;

int64_t now_ms() {
    using namespace std::chrono;
    return duration_cast<milliseconds>(steady_clock::now().time_since_epoch()).count();
}

// ============================================================== evaluación

static bool useNNUE = false;
void eval_use_nnue(bool on) { useNNUE = on; }
bool eval_nnue_ready() { return nnue_loaded(); }

Value evaluate(const Position& pos) {
    if (useNNUE && nnue_loaded()) return nnue_evaluate(pos);

    Color us = pos.side_to_move();
    // material + avance hacia la zona de promocion, ambos incrementales.
    // El material solo no sirve de maestro (learning net1-postmortem de
    // Terachess: la red no tiene nada que aprender por encima de una funcion
    // exacta); el avance es conocimiento real y barato de la variante.
    Value v = pos.material(us) - pos.material(~us)
            + pos.advance(us) - pos.advance(~us);
    return v + 20;                                    // tempo
}

// ============================================================= historiales

void Histories::clear() {
    std::memset(butterfly, 0, sizeof(butterfly));
    std::memset(capture, 0, sizeof(capture));
    std::memset(cont, 0, sizeof(cont));
    std::memset(killers, 0, sizeof(killers));
}

void SearchCounters::add(const SearchCounters& other) {
    mainNodes += other.mainNodes;
    qsearchNodes += other.qsearchNodes;
    ttProbes += other.ttProbes;
    ttHits += other.ttHits;
    ttCutoffs += other.ttCutoffs;
    moveBetaCutoffs += other.moveBetaCutoffs;
    firstMoveBetaCutoffs += other.firstMoveBetaCutoffs;
}

void SearchStats::merge(const SearchStats& other) {
    searches += other.searches;
    completedDepth = std::max(completedDepth, other.completedDepth);
    total.add(other.total);
    for (int d = 0; d < MAX_PLY; ++d) {
        byDepth[d].searches += other.byDepth[d].searches;
        byDepth[d].cumulativeNodes += other.byDepth[d].cumulativeNodes;
        byDepth[d].counters.add(other.byDepth[d].counters);
    }
}

static SearchCounters counter_delta(const SearchCounters& now,
                                    const SearchCounters& before) {
    SearchCounters d;
    d.mainNodes = now.mainNodes - before.mainNodes;
    d.qsearchNodes = now.qsearchNodes - before.qsearchNodes;
    d.ttProbes = now.ttProbes - before.ttProbes;
    d.ttHits = now.ttHits - before.ttHits;
    d.ttCutoffs = now.ttCutoffs - before.ttCutoffs;
    d.moveBetaCutoffs = now.moveBetaCutoffs - before.moveBetaCutoffs;
    d.firstMoveBetaCutoffs = now.firstMoveBetaCutoffs - before.firstMoveBetaCutoffs;
    return d;
}

// =============================================== tablas de reducción (F2)
//
// AUDITORÍA DE CONSTANTES, hecha ANTES de medir nada (docs/search-audit.md).
//
// El chasis trae `r -= moveCount * 62` sobre el producto logarítmico. Con el
// branching MEDIDO de Taikyoku (mediana 944, máximo 1.254) ese término lineal
// desborda al logarítmico y convierte las reducciones en EXTENSIONES de hasta
// 71 plies. En Terachess extendía 4,7; aquí es un orden de magnitud peor.
//
// Decisión: se ELIMINA el término lineal. Queda el producto logarítmico puro,
// que es monótono creciente en moveCount y nunca negativo — defendible por
// construcción, no por medida. El factor global queda como knob de F5.
static int Reductions[MAX_MOVES + 1];

static void init_reductions() {
    Reductions[0] = 0;
    for (int i = 1; i <= MAX_MOVES; ++i)
        Reductions[i] = int(22.14 * std::log(double(i)));
}

static inline int reduction(int depth, int moveCount, bool improving) {
    int r = Reductions[std::min(depth, MAX_MOVES)] * Reductions[std::min(moveCount, MAX_MOVES)];
    return std::max(0, (r / 1024) - (improving ? 1 : 0));
}

// LMP: `(3 + depth^2)/(2 - improving)` deja pasar casi todo en ajedrez (35
// legales) y aquí poda del 84 % al 98 % de los quiets. La corrección escala el
// umbral con el branching REAL del nodo, de modo que la FRACCIÓN podada sea
// comparable a la de ajedrez en vez de la cantidad absoluta.
// Familia abierta en F5 con presupuesto declarado; esta es la variante (a).
static inline int lmp_threshold(int depth, bool improving, int nMoves) {
    int base = (3 + depth * depth) / (improving ? 1 : 2);
    return base * (1 + nMoves / 128);
}

// ================================================================ búsqueda

bool Search::time_up() {
    if (stopped) return true;
    if (limits.nodes && nodes >= limits.nodes) { stopped = true; return true; }
    if (hardLimit && (nodes & 1023) == 0 && now_ms() - startTime >= hardLimit) {
        stopped = true;
        return true;
    }
    return false;
}

// Limite de la qsearch. En ajedrez la qsearch converge sola porque las capturas
// se agotan; con 804 piezas en el tablero NO se agotan: una sola llamada
// consumia los 300.000 nodos del limite y la busqueda se quedaba en depth 1.
// Se acota por profundidad y con poda delta. Ambas constantes son knobs de F5.
constexpr int QS_MAX_DEPTH = 6;

// ---- knobs medidos, no elegidos a ojo (bench 4 = nodos a profundidad fija,
// ---- menos es mejor). Barrido completo en docs/search-audit.md §9.
//
//   improving cableado a true (original) ......... 10.008.901
//   solo improving real .......................... 9.787.157   -2,2 %  ADOPTADO
//   solo historial de continuacion ............... 13.511.282  +35 %   RECHAZADO
//   improving + aspiracion delta 400 ............. 9.586.353   -2,1 %  ADOPTADO
//   ... delta 800 ................................ 10.318.745  +5 %
//   ... delta 1500 ............................... 7.395.842   -24 %   (ver nota)
//   ... delta 3000 ............................... 9.147.113   -7 %
//
// El barrido es IRREGULAR: 1500 gana por mucho pero sus vecinos 800 y 3000
// pierden. Cinco puntos sobre 8 posiciones no justifican tomar el argmax, asi
// que se fija el valor defendible (400 ~ 8 peones) y el ancho queda como
// familia de F5 con presupuesto declarado.
#ifndef ASP_DELTA
#define ASP_DELTA 400
#endif
#ifndef ASP_MIN_DEPTH
#define ASP_MIN_DEPTH 4
#endif
// El ajuste de reduccion por historial engordaba el arbol: desactivado.
#ifndef HIST_RED
#define HIST_RED 0
#endif
// Historial de continuacion y de captura: DESACTIVADO por medida (+35 % de
// nodos). Diagnostico: el bucketing que los hace caber en memoria (32 clases x
// 36 zonas) confunde movimientos sin relacion y mete ruido en la ordenacion en
// vez de senal. Es el riesgo que la auditoria de Terachess anoto para su
// `type % 8`, aqui medido. Familia P6 de F5: probar agrupacion por FAMILIA DE
// MOVIMIENTO antes que por valor.
#ifndef USE_CONT
#define USE_CONT 0
#endif
#ifndef USE_IMPROVING
#define USE_IMPROVING 1
#endif

Value Search::qsearch(Position& pos, Value alpha, Value beta, int ply, int qd) {
    if (pos.lost(pos.side_to_move())) return -VALUE_WIN + ply;
    if (pos.lost(~pos.side_to_move())) return VALUE_WIN - ply;
    if (ply >= MAX_PLY - 1 || qd >= QS_MAX_DEPTH) return evaluate(pos);

    nodes++;
    statsData.total.qsearchNodes++;
    Value best = evaluate(pos);
    if (best >= beta) return best;
    if (best > alpha) alpha = best;

    Move* mv = moveBuf->m[ply];
    int n = pos.gen_captures(mv);

    // ordenación: material capturado descendente
    int* score = moveBuf->qscore;
    for (int i = 0; i < n; ++i) score[i] = pos.see_value(mv[i]);
    for (int i = 0; i < n; ++i) {
        int b = i;
        for (int j = i + 1; j < n; ++j) if (score[j] > score[b]) b = j;
        std::swap(mv[i], mv[b]); std::swap(score[i], score[b]);
    }

    StateInfo st;
    for (int i = 0; i < n; ++i) {
        if (score[i] <= 0) break;                     // capturas perdedoras o nulas
        // poda delta: si ni capturando eso se alcanza alpha, no sigue
        if (best + score[i] + 200 < alpha) break;
        if (time_up()) return best;
        pos.do_move(mv[i], st);
        Value v = -qsearch(pos, -beta, -alpha, ply + 1, qd + 1);
        pos.undo_move(mv[i]);
        if (v > best) {
            best = v;
            if (v > alpha) {
                alpha = v;
                if (v >= beta) break;
            }
        }
    }
    return best;
}

Value Search::search(Position& pos, Value alpha, Value beta, int depth, int ply,
                     bool pvNode, bool cutNode) {
    // ---- terminales (SPEC §7.2: se acaba al capturar el último real) -----
    if (pos.lost(pos.side_to_move())) return -VALUE_WIN + ply;
    if (pos.lost(~pos.side_to_move())) return VALUE_WIN - ply;
    if (ply > 0 && pos.is_repetition(rootPly)) return VALUE_DRAW;
    if (ply >= MAX_PLY - 1) return evaluate(pos);
    if (depth <= 0) return qsearch(pos, alpha, beta, ply, 0);

    nodes++;
    statsData.total.mainNodes++;
    moveBuf->pvLen[ply] = ply;
    if (time_up()) return VALUE_ZERO;

    // ---- transposición ---------------------------------------------------
    bool ttHit = false;
    statsData.total.ttProbes++;
    TTEntry* tte = tt->probe(pos.key(), ttHit);
    if (ttHit) statsData.total.ttHits++;
    Move ttMove = ttHit ? tte->move : Move::none();
    Value ttValue = ttHit ? tte->value_of() : VALUE_NONE;
    if (!pvNode && ttHit && tte->depth() >= depth && ttValue != VALUE_NONE) {
        if (tte->bound() & (ttValue >= beta ? BOUND_LOWER : BOUND_UPPER)) {
            statsData.total.ttCutoffs++;
            return ttValue;
        }
    }

    Value eval = ttHit && tte->eval_of() != VALUE_NONE ? tte->eval_of()
                                                       : evaluate(pos);
    evalStack[ply] = eval;
    // `improving` de verdad: comparar con la evaluacion del mismo bando dos
    // plies atras. Estaba cableado a `true`, lo que hacia el LMP el doble de
    // agresivo de lo pretendido en TODOS los nodos.
    bool improving = !USE_IMPROVING || (ply < 2)
                     ? true : (eval > evalStack[ply - 2]);

    // ---- poda hacia delante ----------------------------------------------
    // Sin jaque en la variante, no hay "in check" que proteja estas podas: el
    // guardián es la existencia de material y que no estemos en un terminal.
    if (!pvNode && !is_decisive(beta)) {
        // razoring / futility: márgenes en la escala PROPIA (peón = 49), no en
        // la de ajedrez. Escalados por el valor del peón medido.
        constexpr Value PAWN = 49;
        if (depth < 7 && eval - 3 * PAWN * depth >= beta) return eval;

        // null move: el zugzwang con 400 piezas por bando es despreciable.
        if (depth >= 3 && eval >= beta && pos.material(pos.side_to_move()) > 4 * PAWN) {
            StateInfo st;
            int R = 3 + depth / 4;
            pos.do_null(st);
            Value v = -search(pos, -beta, -beta + 1, depth - R, ply + 1, false, !cutNode);
            pos.undo_null();
            if (v >= beta && !is_decisive(v)) return v;
        }
    }

    // ---- generación y ordenación ----------------------------------------
    Move* mv = moveBuf->m[ply];
    int n = pos.gen_moves(mv);
    if (n == 0) return -VALUE_WIN + ply;         // [SUPUESTO] SPEC §7.3

    auto& score = moveBuf->score;
    Color us = pos.side_to_move();
    // Contexto de continuacion: que movio 1 y 2 plies atras. Las tablas `cont`
    // y `capture` existian (17 MB por hilo) y NO se usaban: memoria muerta y la
    // mayor ganancia de ordenacion sin explotar.
    const bool has1 = ply >= 1, has2 = ply >= 2;
    const int p1 = has1 ? contPc[ply - 1] : 0, z1 = has1 ? contZn[ply - 1] : 0;
    const int p2 = has2 ? contPc[ply - 2] : 0, z2 = has2 ? contZn[ply - 2] : 0;

    for (int i = 0; i < n; ++i) {
        const Move& m = mv[i];
        if (m == ttMove) { score[ply][i] = 1 << 28; continue; }
        int pc = piece_class(pos.piece_on(m.from()));
        int zn = zone_of(m.to());
        Value cap = pos.see_value(m);
        if (cap > 0) {
            int victim = pos.piece_on(m.to()) >= 0
                       ? piece_class(pos.piece_on(m.to())) : 0;
            score[ply][i] = (1 << 24) + int(cap)
                          + (USE_CONT ? hist->capture[pc][zn][victim] / 8 : 0);
            continue;
        }
        if (m == hist->killers[ply][0]) { score[ply][i] = (1 << 22) + 1; continue; }
        if (m == hist->killers[ply][1]) { score[ply][i] = (1 << 22); continue; }
        int h = hist->butterfly[us][sqOfCell(m.from())][sqOfCell(m.to())];
        if (USE_CONT) {
            if (has1) h += hist->cont[0][p1][z1][pc][zn];
            if (has2) h += hist->cont[1][p2][z2][pc][zn];
        }
        score[ply][i] = h + (m.promo() ? 4096 : 0) + int(cap);
    }

    Value best = -VALUE_INFINITE;
    Move bestMove = Move::none();
    Bound bound = BOUND_UPPER;
    StateInfo st;
    int searched = 0, quiets = 0;
    Move quietList[64];
    int lmpThr = lmp_threshold(depth, improving, n);

    for (int i = 0; i < n; ++i) {
        // selection sort perezoso: con ~1.000 jugadas ordenar todo es caro
        int b = i;
        for (int j = i + 1; j < n; ++j) if (score[ply][j] > score[ply][b]) b = j;
        std::swap(mv[i], mv[b]); std::swap(score[ply][i], score[ply][b]);
        const Move m = mv[i];

        bool cap = pos.is_capture(m);
        if (!cap) {
            if (!pvNode && depth <= 8 && quiets >= lmpThr && best > -VALUE_WIN_IN_MAX_PLY)
                continue;                                  // LMP corregido
            if (quiets < 64) quietList[quiets] = m;
            quiets++;
        }

        int mpc = piece_class(pos.piece_on(m.from()));
        int mzn = zone_of(m.to());
        contPc[ply] = int16_t(mpc);
        contZn[ply] = int16_t(mzn);

        pos.do_move(m, st);
        Value v;
        int newDepth = depth - 1;
        moveBuf->pvLen[ply + 1] = ply + 1;     // sin esto el PV sale vacio

        if (searched == 0) {
            v = -search(pos, -beta, -alpha, newDepth, ply + 1, pvNode, false);
        } else {
            int r = (!cap && depth >= 3) ? reduction(depth, searched + 1, improving) : 0;
            // los movimientos con buen historial se reducen menos
#if HIST_RED > 0
            if (r > 0 && !cap) r -= score[ply][i] / HIST_RED;
#endif
            r = std::min(r, newDepth - 1);
            if (r < 0) r = 0;
            v = -search(pos, -alpha - 1, -alpha, newDepth - r, ply + 1, false, true);
            if (v > alpha && r > 0)
                v = -search(pos, -alpha - 1, -alpha, newDepth, ply + 1, false, !cutNode);
            if (v > alpha && v < beta)
                v = -search(pos, -beta, -alpha, newDepth, ply + 1, true, false);
        }
        pos.undo_move(m);
        searched++;
        if (stopped) return VALUE_ZERO;

        if (v > best) {
            best = v;
            bestMove = m;
            if (v > alpha) {
                alpha = v;
                bound = BOUND_EXACT;
                if (pvNode) {
                    moveBuf->pv[ply][ply] = m;
                    for (int k = ply + 1; k < moveBuf->pvLen[ply + 1]; ++k)
                        moveBuf->pv[ply][k] = moveBuf->pv[ply + 1][k];
                    moveBuf->pvLen[ply] = moveBuf->pvLen[ply + 1];
                }
                if (v >= beta) {
                    statsData.total.moveBetaCutoffs++;
                    if (searched == 1) statsData.total.firstMoveBetaCutoffs++;
                    bound = BOUND_LOWER;
                    int bonus = std::min(depth * depth * 32, 8192);
                    if (!cap) {
                        if (hist->killers[ply][0] != m) {
                            hist->killers[ply][1] = hist->killers[ply][0];
                            hist->killers[ply][0] = m;
                        }
                        hist->update(hist->butterfly[us][sqOfCell(m.from())][sqOfCell(m.to())], bonus);
                        if (has1) hist->update(hist->cont[0][p1][z1][mpc][mzn], bonus);
                        if (has2) hist->update(hist->cont[1][p2][z2][mpc][mzn], bonus);
                        for (int q = 0; q < std::min(quiets, 64); ++q) {
                            const Move& qm = quietList[q];
                            if (qm == m) continue;
                            int qp = piece_class(pos.piece_on(qm.from()));
                            int qz = zone_of(qm.to());
                            hist->update(hist->butterfly[us][sqOfCell(qm.from())]
                                                            [sqOfCell(qm.to())], -bonus);
                            if (has1) hist->update(hist->cont[0][p1][z1][qp][qz], -bonus);
                            if (has2) hist->update(hist->cont[1][p2][z2][qp][qz], -bonus);
                        }
                    } else {
                        int victim = pos.piece_on(m.to()) >= 0
                                   ? piece_class(pos.piece_on(m.to())) : 0;
                        hist->update(hist->capture[mpc][mzn][victim], bonus);
                    }
                    break;
                }
            }
        }
    }

    tte->save(pos.key(), best, pvNode, bound, depth, bestMove, eval, tt->gen());
    return best;
}

SearchResult Search::go(Position& pos, const SearchLimits& lim, bool quiet) {
    // La inicializacion de un static local es sincronizada por C++: el datagen
    // puede entrar aqui por primera vez desde varios workers sin carrera.
    static const bool initialized = [] { init_reductions(); return true; }();
    (void) initialized;

    limits = lim;
    nodes = 0;
    statsData = SearchStats{};
    statsData.searches = 1;
    stopped = false;
    startTime = now_ms();
    rootPly = int(pos.keyHist.size()) - 1;
    tt->new_search();

    // Gestión de tiempo: las partidas de Taikyoku son de MILES de plies
    // (medido 2.367-8.285), así que el divisor de ajedrez (~30) arruinaría el
    // reloj. Se reparte sobre un horizonte largo y se confirma con la medida.
    hardLimit = 0;
    if (lim.movetime) hardLimit = lim.movetime;
    else if (lim.time[pos.side_to_move()]) {
        int64_t t = lim.time[pos.side_to_move()], inc = lim.inc[pos.side_to_move()];
        hardLimit = t / 60 + inc * 3 / 4;
        if (hardLimit > t - 50) hardLimit = std::max<int64_t>(10, t - 50);
    }

    SearchResult res;
    Value alpha = -VALUE_INFINITE, beta = VALUE_INFINITE;
    int maxDepth = lim.depth ? lim.depth : MAX_PLY - 4;

    Value prev = VALUE_ZERO;
    for (int d = 1; d <= maxDepth; ++d) {
        const SearchCounters iterationStart = statsData.total;
        // Ventanas de aspiracion: con branching ~1.000 cada re-busqueda cuesta
        // muchisimo, asi que la ventana empieza estrecha y se ensancha solo si
        // falla. delta en la escala PROPIA (peon = 49).
        Value delta = ASP_DELTA;
        if (ASP_MIN_DEPTH > 0 && d >= ASP_MIN_DEPTH) {
            alpha = std::max(-VALUE_INFINITE, prev - delta);
            beta = std::min(VALUE_INFINITE, prev + delta);
        } else {
            alpha = -VALUE_INFINITE;
            beta = VALUE_INFINITE;
        }
        Value v;
        while (true) {
            v = search(pos, alpha, beta, d, 0, true, false);
            if (stopped) break;
            if (v <= alpha && alpha > -VALUE_INFINITE) {
                beta = (alpha + beta) / 2;
                alpha = std::max(-VALUE_INFINITE, v - delta);
            } else if (v >= beta && beta < VALUE_INFINITE) {
                beta = std::min(VALUE_INFINITE, v + delta);
            } else {
                break;
            }
            delta += delta / 2;
        }
        prev = v;
        if (!stopped) {
            SearchDepthStats& row = statsData.byDepth[d];
            row.searches = 1;
            row.cumulativeNodes = nodes;
            row.counters = counter_delta(statsData.total, iterationStart);
            statsData.completedDepth = d;
        }
        if (stopped && d > 1) break;

        res.score = v;
        res.depth = d;
        if (moveBuf->pvLen[0] > 0) res.best = moveBuf->pv[0][0];
        res.nodes = nodes;
        res.ms = now_ms() - startTime;

        if (!quiet) {
            std::cout << "info depth " << d << " score cp " << v
                      << " nodes " << nodes << " time " << res.ms
                      << " nps " << (res.ms ? nodes * 1000 / res.ms : 0) << " pv";
            for (int k = 0; k < moveBuf->pvLen[0]; ++k) std::cout << " " << move_to_str(moveBuf->pv[0][k]);
            std::cout << std::endl;
        }
        if (is_decisive(v)) break;
        if (hardLimit && now_ms() - startTime > hardLimit / 2) break;
        if (limits.nodes && nodes >= limits.nodes) break;
    }
    if (!res.best) {
        Move* mv = moveBuf->m[0];
        int n = pos.gen_moves(mv);
        if (n) res.best = mv[0];
    }
    return res;
}

uint64_t perft(Position& pos, int depth) {
    static Move buf[MAX_PLY][MAX_MOVES];
    int n = pos.gen_moves(buf[depth]);
    if (depth <= 1) return uint64_t(n);
    uint64_t total = 0;
    StateInfo st;
    for (int i = 0; i < n; ++i) {
        Move m = buf[depth][i];
        pos.do_move(m, st);
        total += perft(pos, depth - 1);
        pos.undo_move(m);
    }
    return total;
}

}  // namespace tk
