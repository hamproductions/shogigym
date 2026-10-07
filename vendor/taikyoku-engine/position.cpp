#include "position.h"

#include <algorithm>
#include <cstring>
#include <random>
#include <sstream>
#include <unordered_map>

namespace tk {

uint64_t ZOB[NPIECE][2][NSQ];
uint64_t ZOB_SIDE;
int16_t Position::dirDelta[NDIR][2];

void init_tables() {
    std::mt19937_64 rng(0x7A1C90C0ULL);
    for (int p = 0; p < NPIECE; ++p)
        for (int c = 0; c < 2; ++c)
            for (int s = 0; s < NSQ; ++s) ZOB[p][c][s] = rng();
    ZOB_SIDE = rng();
    // Las direcciones normativas se resuelven a deltas absolutos UNA vez.
    // Para blancas es la rotación de 180 grados (SPEC §1).
    for (int i = 0; i < NDIR; ++i) {
        Position::dirDelta[i][0] = int16_t(deltaOf(DIRS[i][0], DIRS[i][1]));
        Position::dirDelta[i][1] = int16_t(deltaOf(-DIRS[i][0], -DIRS[i][1]));
    }
}

void Position::clear() {
    for (int i = 0; i < NCELL; ++i) { board[i] = WALL; owner[i] = WALL; }
    for (int r = 1; r <= 36; ++r)
        for (int f = 1; f <= 36; ++f) {
            board[cellOf(f, r)] = EMPTY_SQ;
            owner[cellOf(f, r)] = EMPTY_SQ;
        }
    stm = 0; gamePly = 0; zkey = 0; pieceCnt = 0; st = nullptr;
    royalCnt[0] = royalCnt[1] = 0; mat[0] = mat[1] = 0; adv[0] = adv[1] = 0;
    capStack.clear(); capStack.reserve(1 << 16);
    keyHist.clear(); keyHist.reserve(1 << 12);
    if (dedupKey.empty()) {
        dedupKey.assign(DEDUP_SIZE, 0);
        dedupStamp.assign(DEDUP_SIZE, 0);
        dedupGen = 0;
    }
}

static inline Value adv_term(int pt, int col, int cell) {
    if (PIECES[pt].promotesTo < 0) return 0;      // ya promovida o no promociona
    int r = rankOfCell(cell);
    int fwd = (col == BLACK) ? r : 37 - r;        // 1..36 hacia la zona rival
    return Value(fwd * PIECES[pt].value / 400);
}

void Position::put(int c, int pt, int col) {
    board[c] = int16_t(pt); owner[c] = int8_t(col);
    zkey ^= ZOB[pt][col][sqOfCell(c)];
    if (PIECES[pt].royal) royalCnt[col]++;
    mat[col] += PIECES[pt].value;
    adv[col] += adv_term(pt, col, c);
    pieceCnt++;
}

void Position::take(int c) {
    int pt = board[c], col = owner[c];
    zkey ^= ZOB[pt][col][sqOfCell(c)];
    board[c] = EMPTY_SQ; owner[c] = EMPTY_SQ;
    if (PIECES[pt].royal) royalCnt[col]--;
    mat[col] -= PIECES[pt].value;
    adv[col] -= adv_term(pt, col, c);
    pieceCnt--;
}

void Position::set_start() {
    clear();
    for (int i = 0; i < NPLACE; ++i) {
        const auto& p = INIT_PLACE[i];
        put(cellOf(p[0], p[1]), p[2], p[3]);
    }
    keyHist.push_back(zkey);
}

// --------------------------------------------------------------- movimientos

int Position::capture_cells(const Move& m, int* cells) const {
    int n = 0;
    MoveKind k = m.kind();
    if (k == RANGECAP) {
        int df = fileOfCell(m.to()) - fileOfCell(m.from());
        int dr = rankOfCell(m.to()) - rankOfCell(m.from());
        int step = deltaOf(df == 0 ? 0 : (df > 0 ? 1 : -1),
                           dr == 0 ? 0 : (dr > 0 ? 1 : -1));
        for (int c = m.from() + step; ; c += step) {
            if (board[c] >= 0) cells[n++] = c;
            if (c == m.to()) break;
        }
        return n;
    }
    if (k == IGUI) { cells[n++] = m.mid(); return n; }
    if (k == JITTO) return 0;
    if (k == AREA2 && m.mid() >= 0 && m.mid() != m.to() && board[m.mid()] >= 0)
        cells[n++] = m.mid();
    if (m.to() != m.from() && board[m.to()] >= 0) cells[n++] = m.to();
    return n;
}

bool Position::is_capture(const Move& m) const {
    int c[64];
    return capture_cells(m, c) > 0;
}

Value Position::see_value(const Move& m) const {
    // Aproximación deliberada: suma del material capturado menos el riesgo de
    // la propia pieza. NO se simula el intercambio: con pantallas, ganchos y
    // captura a distancia el bucle clásico de SEE es inválido (docs/search-audit).
    int cells[64];
    int n = capture_cells(m, cells);
    Value v = 0;
    for (int i = 0; i < n; ++i)
        v += (owner[cells[i]] == stm ? -1 : 1) * PIECES[board[cells[i]]].value;
    return v;
}

// Deduplicación por EFECTO con tabla hash abierta: dos jugadas son la misma si
// producen la misma posición. En el spike esto era O(n^2) y dominaba el coste.
template <bool CapturesOnly>
int Position::generate(Move* out) const {
    int n = 0;

    // R-16, incidente real: deduplicar DESPUES de generar desbordaba el buffer.
    // Un solo movedor de gancho en tablero abierto produce ~10.000 jugadas en
    // bruto (4 direcciones x 35 casillas x 2 rayos perpendiculares x 35), muy
    // por encima de MAX_MOVES=8192, aunque tras deduplicar sean <=1.295. La
    // deduplicacion es ahora parte de la INSERCION: `out[]` solo contiene
    // jugadas unicas y `n` nunca supera el branching real.
    if (++dedupGen == 0) { std::fill(dedupStamp.begin(), dedupStamp.end(), 0u); dedupGen = 1; }

    auto push = [&](const Move& m) {
        // Camino rapido: para NORMAL/JUMPSLIDE/HOP/HOOK la unica casilla que se
        // vacia es `to`. Solo AREA2/IGUI/RANGECAP necesitan el calculo completo
        // (y son una minoria de las jugadas). Esto era el punto caliente.
        int cells[64];
        int nc;
        MoveKind mk = m.kind();
        if (mk == NORMAL || mk == JUMPSLIDE || mk == HOP || mk == HOOK) {
            nc = (board[m.to()] >= 0) ? 1 : 0;
            if (nc) cells[0] = m.to();
        } else {
            nc = capture_cells(m, cells);
            if (nc > 1) std::sort(cells, cells + nc);
        }
        if (CapturesOnly && nc == 0) return;
        uint64_t h = 1469598103934665603ULL;
        auto mix = [&](uint64_t x) { h ^= x + 0x9E3779B97F4A7C15ULL; h *= 1099511628211ULL; };
        mix(m.from()); mix(uint64_t(m.to()) << 12);
        mix(m.promo() ? 0xABCDEFULL : 0x123456ULL);
        for (int k = 0; k < nc; ++k) mix(uint64_t(cells[k]) * 2654435761ULL);
        uint32_t idx = uint32_t(h) & (DEDUP_SIZE - 1);
        while (dedupStamp[idx] == dedupGen) {
            if (dedupKey[idx] == h) return;                 // ya emitida
            idx = (idx + 1) & (DEDUP_SIZE - 1);
        }
        dedupStamp[idx] = dedupGen;
        dedupKey[idx] = h;
        if (n < MAX_MOVES) out[n++] = m;
        else std::abort();     // desbordar en silencio seria corrupcion (R-16)
    };

    auto emit = [&](int from, int to, int mid, MoveKind k) {
        int pt = board[from];
        int16_t tgt = PIECES[pt].promotesTo;
        bool zone = false;
        if (tgt >= 0) {
            int rf = rankOfCell(from), rt = rankOfCell(to);
            zone = stm == BLACK ? (rt >= 26 || rf >= 26) : (rt <= 11 || rf <= 11);
        }
        if (zone) {
            push(Move(from, to, mid, k, true));
            // Promoción forzada solo si la pieza quedaría inmóvil (SPEC §6).
            bool stuck = true;
            for (int a = ATOM_OFF[pt]; a < ATOM_OFF[pt + 1] && stuck; ++a) {
                const Atom& at = ATOMS[a];
                if (at.kind != 0) { stuck = false; break; }
                for (int d = 0; d < at.nDir; ++d)
                    if (board[to + dirDelta[at.dirOff + d][stm]] != WALL) { stuck = false; break; }
            }
            if (!stuck) push(Move(from, to, mid, k, false));
        } else {
            push(Move(from, to, mid, k, false));
        }
    };

    for (int c = 0; c < NCELL; ++c) {
        if (owner[c] != stm) continue;
        int pt = board[c];
        for (int ai = ATOM_OFF[pt]; ai < ATOM_OFF[pt + 1]; ++ai) {
            const Atom& a = ATOMS[ai];
            switch (a.kind) {
            case 0:                                    // slide
                for (int d = 0; d < a.nDir; ++d) {
                    int dd = dirDelta[a.dirOff + d][stm], cur = c;
                    for (int s = 0; s < a.range; ++s) {
                        cur += dd;
                        int o = owner[cur];
                        if (o == WALL) break;
                        if (o == EMPTY_SQ) {
                            if (a.mode != 2 && !CapturesOnly) emit(c, cur, -1, NORMAL);
                            continue;
                        }
                        if (o != stm && a.mode != 1) emit(c, cur, -1, NORMAL);
                        break;
                    }
                }
                break;
            case 1:                                    // jump
                for (int d = 0; d < a.nDir; ++d) {
                    int t = c + dirDelta[a.dirOff + d][stm], o = owner[t];
                    if (o == WALL || o == stm) continue;
                    if ((o == EMPTY_SQ && a.mode == 2) || (o != EMPTY_SQ && a.mode == 1)) continue;
                    if (CapturesOnly && o == EMPTY_SQ) continue;
                    emit(c, t, -1, NORMAL);
                }
                break;
            case 2: {                                  // jumpslide
                int dists[2] = {a.d0, a.d1};
                for (int d = 0; d < a.nDir; ++d) {
                    int dd = dirDelta[a.dirOff + d][stm];
                    for (int di = 0; di < 2; ++di) {
                        if (di == 1 && a.d1 == 0) break;
                        int land = c + dd * dists[di], o = owner[land];
                        if (o == WALL || o == stm) continue;
                        if (!CapturesOnly || o != EMPTY_SQ) emit(c, land, c + dd, JUMPSLIDE);
                        if (o != EMPTY_SQ) continue;
                        int cur = land;
                        for (int s2 = 0; s2 < a.tail; ++s2) {
                            cur += dd;
                            int o2 = owner[cur];
                            if (o2 == WALL || o2 == stm) break;
                            if (!CapturesOnly || o2 != EMPTY_SQ) emit(c, cur, land, JUMPSLIDE);
                            if (o2 != EMPTY_SQ) break;
                        }
                    }
                }
                break; }
            case 3:                                    // hop
                for (int d = 0; d < a.nDir; ++d) {
                    int dd = dirDelta[a.dirOff + d][stm], cur = c, scr = 0;
                    while (true) {
                        cur += dd;
                        int o = owner[cur];
                        if (o == WALL) break;
                        if (o == EMPTY_SQ) {
                            if (!CapturesOnly) emit(c, cur, scr ? c : -1, scr ? HOP : NORMAL);
                            continue;
                        }
                        if (o != stm) emit(c, cur, scr ? c : -1, scr ? HOP : NORMAL);
                        if (++scr > a.screens) break;
                    }
                }
                break;
            case 4:                                    // hook
                for (int d = 0; d < a.nDir; ++d) {
                    int df = DIRS[a.dirOff + d][0], dr = DIRS[a.dirOff + d][1];
                    int p0f, p0r, p1f, p1r;
                    if (a.geom == 0) { p0f = -dr; p0r = df; p1f = dr; p1r = -df; }
                    else { p0f = df; p0r = -dr; p1f = -df; p1r = dr; }
                    int sg = stm == 0 ? 1 : -1;
                    int dd = deltaOf(sg * df, sg * dr), cur = c;
                    while (true) {
                        cur += dd;
                        int o = owner[cur];
                        if (o == WALL) break;
                        if (o != stm && (!CapturesOnly || o != EMPTY_SQ)) emit(c, cur, -1, NORMAL);
                        if (o != EMPTY_SQ) break;
                        int pds[2] = {deltaOf(sg * p0f, sg * p0r), deltaOf(sg * p1f, sg * p1r)};
                        for (int q = 0; q < 2; ++q) {
                            int c2 = cur;
                            while (true) {
                                c2 += pds[q];
                                int o2 = owner[c2];
                                if (o2 == WALL || o2 == stm) break;
                                if (!CapturesOnly || o2 != EMPTY_SQ) emit(c, c2, cur, HOOK);
                                if (o2 != EMPTY_SQ) break;
                            }
                        }
                    }
                }
                break;
            case 5: {                                  // area2 (león)
                static const int KD[8][2] = {{1,0},{-1,0},{0,1},{0,-1},
                                             {1,1},{1,-1},{-1,1},{-1,-1}};
                for (int i = 0; i < 8; ++i) {
                    int s1 = c + deltaOf(KD[i][0], KD[i][1]), o1 = owner[s1];
                    if (o1 == WALL || o1 == stm) continue;
                    if (!CapturesOnly || o1 != EMPTY_SQ) emit(c, s1, -1, AREA2);
                    for (int j = 0; j < 8; ++j) {
                        int s2 = s1 + deltaOf(KD[j][0], KD[j][1]);
                        if (s2 == c) {
                            // igui = capturar sin moverse; jitto = pasar turno
                            if (o1 != EMPTY_SQ) push(Move(c, c, s1, IGUI, false));
                            else if (!CapturesOnly) push(Move(c, c, s1, JITTO, false));
                            continue;
                        }
                        int o2 = owner[s2];
                        if (o2 == WALL || o2 == stm) continue;
                        if (CapturesOnly && o1 == EMPTY_SQ && o2 == EMPTY_SQ) continue;
                        emit(c, s2, s1, AREA2);
                    }
                }
                break; }
            case 6: {                                  // rangecap
                int myr = PIECES[pt].rankCap;
                for (int d = 0; d < a.nDir; ++d) {
                    int dd = dirDelta[a.dirOff + d][stm], cur = c;
                    bool anyCap = false;
                    while (true) {
                        cur += dd;
                        int o = owner[cur];
                        if (o == WALL) break;
                        if (o != EMPTY_SQ) {
                            if (PIECES[board[cur]].rankCap <= myr) break;
                            anyCap = true;
                        }
                        if (!CapturesOnly || anyCap || o != EMPTY_SQ)
                            push(Move(c, cur, -1, RANGECAP, false));
                    }
                }
                break; }
            }
        }
    }

    return n;
}

int Position::gen_moves(Move* out) const { return generate<false>(out); }
int Position::gen_captures(Move* out) const { return generate<true>(out); }

// ------------------------------------------------------------- do / undo

void Position::do_move(const Move& m, StateInfo& s) {
    s.previous = st;
    s.key = zkey;
    s.capBase = int(capStack.size());
    s.promotedFrom = -1;
    s.move = m;
    s.movedPiece = board[m.from()];

    int cells[64];
    int nc = capture_cells(m, cells);
    for (int i = 0; i < nc; ++i)
        capStack.push_back({int16_t(cells[i]), board[cells[i]], owner[cells[i]]});
    for (int i = 0; i < nc; ++i) take(cells[i]);
    s.capCount = nc;

    MoveKind k = m.kind();
    if (k != IGUI && k != JITTO) {
        int pt = board[m.from()];
        take(m.from());
        if (m.promo()) { s.promotedFrom = int16_t(pt); pt = PIECES[pt].promotesTo; }
        put(m.to(), pt, stm);
    } else if (m.promo()) {
        int pt = board[m.from()];
        take(m.from());
        s.promotedFrom = int16_t(pt);
        put(m.from(), PIECES[pt].promotesTo, stm);
    }
    stm ^= 1; zkey ^= ZOB_SIDE; gamePly++;
    keyHist.push_back(zkey);
    st = &s;
}

void Position::undo_move(const Move& m) {
    const StateInfo& s = *st;
    keyHist.pop_back();
    stm ^= 1; gamePly--;
    MoveKind k = m.kind();
    if (k != IGUI && k != JITTO) {
        int pt = board[m.to()];
        take(m.to());
        put(m.from(), s.promotedFrom >= 0 ? s.promotedFrom : pt, stm);
    } else if (s.promotedFrom >= 0) {
        take(m.from());
        put(m.from(), s.promotedFrom, stm);
    }
    for (int i = s.capCount - 1; i >= 0; --i) {
        const auto& c = capStack[s.capBase + i];
        put(c.cell, c.piece, c.color);
    }
    capStack.resize(s.capBase);
    zkey = s.key;
    st = s.previous;
}

void Position::do_null(StateInfo& s) {
    s.previous = st;
    s.key = zkey; s.capBase = int(capStack.size()); s.capCount = 0;
    s.promotedFrom = -1; s.move = Move::null(); s.movedPiece = -1;
    stm ^= 1; zkey ^= ZOB_SIDE; gamePly++;
    keyHist.push_back(zkey);
    st = &s;
}

void Position::undo_null() {
    keyHist.pop_back();
    stm ^= 1; gamePly--;
    zkey = st->key;
    st = st->previous;
}

// SPEC §7.3 [SUPUESTO]: la cuarta aparición de la misma posición son tablas.
// Aquí, dentro de la búsqueda, basta con detectar la repetición para devolver
// tablas: es la convención estándar y evita gastar nodos en ciclos.
bool Position::is_repetition(int rootPly) const {
    int n = int(keyHist.size());
    int cnt = 0;
    for (int i = n - 3; i >= 0; i -= 2) {
        if (keyHist[i] == zkey) {
            if (i >= n - 1 - rootPly) return true;      // repetición dentro del árbol
            if (++cnt >= 2) return true;                 // ya vista 2 veces en la partida
        }
    }
    return false;
}

int Position::repetition_count() const {
    int c = 0;
    for (size_t i = 0; i < keyHist.size(); ++i)
        if (keyHist[i] == zkey) ++c;
    return c;
}

// -------------------------------------------------------------------- TSN

static std::string sq_name(int c) {
    int f = fileOfCell(c);
    char letter = f <= 26 ? char('a' + f - 1) : char('A' + f - 27);
    return std::string(1, letter) + std::to_string(rankOfCell(c));
}

std::string move_to_str(const Move& m) {
    if (!m) return "0000";
    std::string s = sq_name(m.from()) + sq_name(m.to());
    if (m.mid() >= 0) s += "/" + sq_name(m.mid());
    if (m.promo()) s += "+";
    return s;
}

std::string Position::tsn() const {
    std::ostringstream o;
    for (int r = 36; r >= 1; --r) {
        int empty = 0; bool first = true;
        for (int f = 1; f <= 36; ++f) {
            int c = cellOf(f, r);
            if (board[c] < 0) { ++empty; continue; }
            if (empty) { if (!first) o << ','; o << empty; empty = 0; first = false; }
            if (!first) o << ',';
            const auto& pi = PIECES[board[c]];
            if (pi.promoted) o << '+';
            o << pi.abbrev << (owner[c] == BLACK ? 'b' : 'w');
            first = false;
        }
        if (empty) { if (!first) o << ','; o << empty; }
        if (r > 1) o << '/';
    }
    o << ' ' << (stm == BLACK ? 'b' : 'w') << ' ' << gamePly
      << ' ' << (gamePly / 2 + 1);
    return o.str();
}

bool Position::set_tsn(const std::string& s) {
    clear();
    static std::unordered_map<std::string, int> abbr2base;
    if (abbr2base.empty())
        for (int i = 0; i < NPIECE; ++i)
            if (!PIECES[i].promoted) abbr2base[PIECES[i].abbrev] = i;

    std::istringstream in(s);
    std::string rows, side, plyS;
    if (!(in >> rows)) return false;
    in >> side >> plyS;

    int r = 36; size_t pos = 0;
    while (r >= 1) {
        size_t slash = rows.find('/', pos);
        std::string row = rows.substr(pos, slash == std::string::npos
                                            ? std::string::npos : slash - pos);
        int f = 1; size_t tp = 0;
        while (tp < row.size()) {
            size_t comma = row.find(',', tp);
            std::string tok = row.substr(tp, comma == std::string::npos
                                              ? std::string::npos : comma - tp);
            if (!tok.empty()) {
                if (isdigit((unsigned char)tok[0])) f += atoi(tok.c_str());
                else {
                    bool pr = tok[0] == '+';
                    std::string t = pr ? tok.substr(1) : tok;
                    int col = t.back() == 'b' ? BLACK : WHITE;
                    std::string ab = t.substr(0, t.size() - 1);
                    auto it = abbr2base.find(ab);
                    if (it == abbr2base.end()) return false;
                    int pt = pr ? PIECES[it->second].promotesTo : it->second;
                    if (pt < 0) return false;
                    put(cellOf(f, r), pt, col);
                    ++f;
                }
            }
            if (comma == std::string::npos) break;
            tp = comma + 1;
        }
        if (slash == std::string::npos) break;
        pos = slash + 1; --r;
    }
    stm = (side == "w") ? WHITE : BLACK;
    if (stm == WHITE) zkey ^= ZOB_SIDE;
    gamePly = plyS.empty() ? 0 : atoi(plyS.c_str());
    keyHist.push_back(zkey);
    return true;
}

}  // namespace tk
