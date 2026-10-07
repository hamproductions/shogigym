// uci.cpp — protocolo, bench, perft y punto de entrada.
//
// UCI con coordenadas propias (a1..AJ36) y notacion de tablero TSN: con 404
// identidades el FEN de un caracter por pieza es imposible (ADR-007).
#include <cstring>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#include "nnue.h"
#include "search.h"

namespace tk {

namespace {

Position rootPos;
Search   searcher;
std::vector<StateInfo> gameStates;

uint64_t rate_bp(uint64_t numerator, uint64_t denominator) {
    return denominator
         ? uint64_t((__uint128_t(numerator) * 10000) / denominator)
         : 0;
}

void print_search_stats(const SearchStats& stats) {
    const SearchCounters& t = stats.total;
    uint64_t completedNodes = 0;
    for (int d = 1; d < MAX_PLY; ++d)
        completedNodes += stats.byDepth[d].counters.counted_nodes();
    const uint64_t totalNodes = t.counted_nodes();
    const uint64_t incompleteNodes = totalNodes >= completedNodes
                                   ? totalNodes - completedNodes : 0;

    std::cout << "info string searchstats summary"
              << " searches " << stats.searches
              << " completed_depth " << stats.completedDepth
              << " nodes " << totalNodes
              << " incomplete_nodes " << incompleteNodes
              << " main_nodes " << t.mainNodes
              << " qsearch_nodes " << t.qsearchNodes
              << " qshare_bp " << rate_bp(t.qsearchNodes, totalNodes)
              << " tt_probes " << t.ttProbes
              << " tt_hits " << t.ttHits
              << " tt_hit_bp " << rate_bp(t.ttHits, t.ttProbes)
              << " tt_cutoffs " << t.ttCutoffs
              << " tt_cutoff_bp " << rate_bp(t.ttCutoffs, t.ttHits)
              << " move_beta_cutoffs " << t.moveBetaCutoffs
              << " first_move_beta_cutoffs " << t.firstMoveBetaCutoffs
              << " first_move_bp "
              << rate_bp(t.firstMoveBetaCutoffs, t.moveBetaCutoffs)
              << std::endl;

    for (int d = 1; d < MAX_PLY; ++d) {
        const SearchDepthStats& row = stats.byDepth[d];
        if (!row.searches) continue;
        const SearchCounters& c = row.counters;
        const uint64_t rowNodes = c.counted_nodes();
        std::cout << "info string searchstats depth"
                  << " depth " << d
                  << " searches " << row.searches
                  << " nodes " << rowNodes
                  << " cumulative_nodes " << row.cumulativeNodes
                  << " main_nodes " << c.mainNodes
                  << " qsearch_nodes " << c.qsearchNodes
                  << " qshare_bp " << rate_bp(c.qsearchNodes, rowNodes)
                  << " tt_probes " << c.ttProbes
                  << " tt_hits " << c.ttHits
                  << " tt_hit_bp " << rate_bp(c.ttHits, c.ttProbes)
                  << " tt_cutoffs " << c.ttCutoffs
                  << " move_beta_cutoffs " << c.moveBetaCutoffs
                  << " first_move_beta_cutoffs " << c.firstMoveBetaCutoffs
                  << " first_move_bp "
                  << rate_bp(c.firstMoveBetaCutoffs, c.moveBetaCutoffs)
                  << std::endl;
    }
}

Move parse_move(const Position& pos, const std::string& tok) {
    static Move buf[MAX_MOVES];
    int n = pos.gen_moves(buf);
    for (int i = 0; i < n; ++i)
        if (move_to_str(buf[i]) == tok) return buf[i];
    // tolerancia: sin la parte /mid
    for (int i = 0; i < n; ++i) {
        std::string s = move_to_str(buf[i]);
        size_t sl = s.find('/');
        if (sl != std::string::npos) {
            std::string t = s.substr(0, sl) + (s.back() == '+' ? "+" : "");
            if (t == tok) return buf[i];
        }
    }
    return Move::none();
}

void cmd_position(std::istringstream& is) {
    std::string tok;
    is >> tok;
    gameStates.clear();
    gameStates.reserve(20000);
    if (tok == "startpos") {
        rootPos.set_start();
        is >> tok;
    } else if (tok == "tsn") {
        std::string tsn, w;
        while (is >> w && w != "moves") tsn += (tsn.empty() ? "" : " ") + w;
        rootPos.set_tsn(tsn);
        tok = w;
    }
    if (tok == "moves") {
        std::string mv;
        while (is >> mv) {
            Move m = parse_move(rootPos, mv);
            if (!m) { std::cout << "info string jugada ilegal: " << mv << std::endl; break; }
            gameStates.emplace_back();
            // NO se empuja el acumulador aqui: la pila de acumuladores es de
            // la BUSQUEDA (MAX_PLY niveles), no del historial de la partida.
            // Empujar una vez por jugada la desbordaba a partir del ply 136 y
            // el motor moria en mitad del match. Basta con el refresco final.
            rootPos.do_move(m, gameStates.back());
        }
    }
    if (nnue_loaded()) nnue_reset(rootPos);
}

void cmd_go(std::istringstream& is) {
    SearchLimits lim;
    std::string tok;
    while (is >> tok) {
        if (tok == "depth") is >> lim.depth;
        else if (tok == "nodes") is >> lim.nodes;
        else if (tok == "movetime") is >> lim.movetime;
        else if (tok == "wtime") is >> lim.time[WHITE];
        else if (tok == "btime") is >> lim.time[BLACK];
        else if (tok == "winc") is >> lim.inc[WHITE];
        else if (tok == "binc") is >> lim.inc[BLACK];
        else if (tok == "infinite") lim.infinite = true;
        else if (tok == "perft") {
            int d; is >> d;
            int64_t t0 = now_ms();
            uint64_t n = perft(rootPos, d);
            int64_t dt = now_ms() - t0;
            std::cout << "perft(" << d << ") = " << n << "  " << dt << " ms  "
                      << (dt ? n * 1000 / dt : 0) << " nps" << std::endl;
            return;
        }
    }
    if (nnue_loaded()) nnue_reset(rootPos);
    SearchResult r = searcher.go(rootPos, lim);
    std::cout << "bestmove " << move_to_str(r.best) << std::endl;
}

// Bench determinista: firma = nodos totales. Una firma que NO cambia cuando
// solo cambian unidades o nombres es en si misma evidencia.
void cmd_bench(std::istringstream& is) {
    int depth = 4, n = 8;
    is >> depth;
    std::string option;
    bool showStats = false;
    while (is >> option) if (option == "stats") showStats = true;
    uint64_t total = 0;
    SearchStats aggregate;
    int64_t t0 = now_ms();
    Position p;
    std::vector<StateInfo> sts(4096);
    for (int g = 0; g < n; ++g) {
        p.set_start();
        int used = 0;
        // random-walk determinista: el mismo camino en toda ejecucion
        uint64_t rng = 0x9E3779B97F4A7C15ULL * (g + 1);
        static Move buf[MAX_MOVES];
        for (int k = 0; k < g * 3; ++k) {
            int nm = p.gen_moves(buf);
            if (!nm) break;
            rng ^= rng << 13; rng ^= rng >> 7; rng ^= rng << 17;
            p.do_move(buf[rng % nm], sts[used++]);
        }
        SearchLimits lim;
        lim.depth = depth;
        SearchResult r = searcher.go(p, lim, true);
        total += r.nodes;
        aggregate.merge(searcher.stats());
    }
    int64_t dt = now_ms() - t0;
    if (showStats) print_search_stats(aggregate);
    std::cout << "\n===========================\nTotal time (ms): " << dt
              << "\nNodes searched: " << total
              << "\nNodes/second: " << (dt ? total * 1000 / dt : 0)
              << "\nBench: " << total << std::endl;
}

void cmd_dump_nnue(std::istringstream& is) {
    // Volcado para el gate de paridad motor<->python (tolerancia 0 cp).
    NnueDebug d;
    nnue_debug(rootPos, d);
    std::cout << "bucket " << d.bucket << " psqt " << d.psqt
              << " positional " << d.positional << " total " << d.total << "\n";
    for (int p = 0; p < 2; ++p) {
        std::cout << "features" << p << " " << d.nActive[p];
        for (int i = 0; i < d.nActive[p]; ++i) std::cout << " " << d.active[p][i];
        std::cout << "\n";
    }
    std::cout << std::flush;
}

}  // namespace

// shogigym: the original blocking uci_loop() is split into an init step and a
// per-line handler so the engine can be driven from a WebAssembly worker.
void uci_init() {
    init_tables();
    TT.resize(16);
    rootPos.set_start();
}

// Returns false on "quit".
bool uci_handle(const std::string& line) {
    std::istringstream is(line);
    std::string tok;
    is >> tok;
    if (tok == "uci") {
        std::cout << "id name TaikyokuShogi-Stockfish 0.1\n"
                  << "option name Hash type spin default 16 min 1 max 1024\n"
                  << "uciok" << std::endl;
    } else if (tok == "isready") {
        std::cout << "readyok" << std::endl;
    } else if (tok == "ucinewgame") {
        TT.clear();
        searcher.clear_state();
    } else if (tok == "setoption") {
        std::string w, name, value;
        is >> w;                                    // "name"
        while (is >> w && w != "value") name += (name.empty() ? "" : " ") + w;
        while (is >> w) value += (value.empty() ? "" : " ") + w;
        if (name == "Hash") TT.resize(std::max(1, atoi(value.c_str())));
    } else if (tok == "position") {
        cmd_position(is);
    } else if (tok == "go") {
        cmd_go(is);
    } else if (tok == "perft") {
        int d; is >> d;
        int64_t t0 = now_ms();
        uint64_t n = perft(rootPos, d);
        int64_t dt = now_ms() - t0;
        std::cout << "perft(" << d << ") = " << n << "  " << dt << " ms  "
                  << (dt ? n * 1000 / dt : 0) << " nps" << std::endl;
    } else if (tok == "d") {
        std::cout << rootPos.tsn() << "\nreales b=" << rootPos.royals(BLACK)
                  << " w=" << rootPos.royals(WHITE)
                  << " piezas=" << rootPos.piece_count() << std::endl;
    } else if (tok == "eval") {
        std::cout << "eval " << evaluate(rootPos)
                  << " material " << (rootPos.material(rootPos.side_to_move())
                                      - rootPos.material(~rootPos.side_to_move()))
                  << std::endl;
    } else if (tok == "inspect") {
        static Move buf[MAX_MOVES];
        static std::vector<Move> controls;
        for (Color side : {BLACK, WHITE}) {
            char color = side == BLACK ? 'b' : 'w';
            int n = rootPos.gen_moves(side, buf);
            std::cout << "moves " << color << " " << n;
            for (int i = 0; i < n; ++i) std::cout << " " << move_to_str(buf[i]);
            std::cout << "\n";
            rootPos.gen_controls(side, controls);
            std::cout << "control " << color;
            for (const Move& m : controls) std::cout << " " << move_to_str(m);
            std::cout << std::endl;
        }
    } else if (tok == "moves") {
        static Move buf[MAX_MOVES];
        int n = rootPos.gen_moves(buf);
        std::cout << n;
        for (int i = 0; i < n; ++i) std::cout << " " << move_to_str(buf[i]);
        std::cout << std::endl;
    } else if (tok == "quit") {
        return false;
    }
    return true;
}

}  // namespace tk

