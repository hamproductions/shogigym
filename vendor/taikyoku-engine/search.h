// search.h — evaluación, historiales bucketed y búsqueda.
#pragma once

#include <atomic>
#include <cstdint>

#include "position.h"
#include "tt.h"

namespace tk {

std::string move_to_str(const Move& m);

// ------------------------------------------------------------- evaluación
// Baseline de F1/F2: material + término posicional pequeño. El material solo
// no sirve de maestro (learning de Terachess: la red no tiene nada que
// aprender por encima de una función exacta), así que se le añade avance hacia
// la zona de promoción, que es conocimiento real de la variante y barato.
Value evaluate(const Position& pos);
void  eval_use_nnue(bool on);
bool  eval_nnue_ready();

// ------------------------------------------------------- historiales (R-10)
// Sin bucketing: ContinuationHistory ~3,6 EB, CapturePieceToHistory 800 GB.
// Con clases de pieza (32) y zonas de 6x6 (36): 10,6 MB y 1,3 MB.
struct Histories {
    int16_t butterfly[2][NSQ][NSQ];                        // 6,7 MB
    int16_t capture[PIECE_CLASSES][NZONE][PIECE_CLASSES];  // pequeña
    int16_t cont[2][PIECE_CLASSES][NZONE][PIECE_CLASSES][NZONE];
    Move    killers[MAX_PLY][2];

    void clear();
    void update(int16_t& e, int bonus) {
        e += int16_t(bonus - e * std::abs(bonus) / 16384);
    }
};

struct SearchLimits {
    int64_t movetime = 0;
    int64_t time[2] = {0, 0};
    int64_t inc[2] = {0, 0};
    uint64_t nodes = 0;
    int depth = 0;
    bool infinite = false;
};

struct SearchResult {
    Move  best = Move::none();
    Value score = VALUE_ZERO;
    int   depth = 0;
    uint64_t nodes = 0;
    int64_t ms = 0;
};

// ------------------------------------------------ instrumentacion F5-P0
// Contadores locales a un objeto Search: el datagen usa un Search por hilo, de
// modo que no necesitan atomicos ni estado global. Todos son u64 porque una
// campana larga puede visitar muchos mas de 2^32 nodos.
struct SearchCounters {
    uint64_t mainNodes = 0;
    uint64_t qsearchNodes = 0;
    uint64_t ttProbes = 0;
    uint64_t ttHits = 0;
    uint64_t ttCutoffs = 0;
    uint64_t moveBetaCutoffs = 0;
    uint64_t firstMoveBetaCutoffs = 0;

    uint64_t counted_nodes() const { return mainNodes + qsearchNodes; }
    void add(const SearchCounters& other);
};

struct SearchDepthStats {
    // Numero de busquedas que completaron esta iteracion. En una busqueda
    // normal vale 1; al agregar bench vale el numero de posiciones.
    uint64_t searches = 0;
    uint64_t cumulativeNodes = 0;
    SearchCounters counters;
};

struct SearchStats {
    uint64_t searches = 0;
    int completedDepth = 0;
    SearchCounters total;
    SearchDepthStats byDepth[MAX_PLY]{};

    void merge(const SearchStats& other);
};

class Search {
public:
    // `moveBuf` son 128 x 8192 x 8 B = 8,4 MB: como MIEMBRO de un objeto en
    // pila desborda el stack en cuanto el datagen crea un Search por partida.
    // Va al heap, igual que los historiales.
    explicit Search(TranspositionTable& table = TT) : tt(&table) {
        hist = new Histories();
        hist->clear();
        moveBuf = new MoveBuf();
    }
    Search(const Search&) = delete;
    Search& operator=(const Search&) = delete;
    ~Search() { delete hist; delete moveBuf; }

    SearchResult go(Position& pos, const SearchLimits& lim, bool quiet = false);
    void stop() { stopped = true; }
    void clear_state() { hist->clear(); statsData = SearchStats{}; }
    const SearchStats& stats() const { return statsData; }

    uint64_t nodes = 0;

private:
    Value search(Position& pos, Value alpha, Value beta, int depth, int ply,
                 bool pvNode, bool cutNode);
    // Historial de continuacion: hay que recordar QUE movio en cada ply, no
    // solo el movimiento. Se guarda ya bucketed (clase de pieza + zona) para
    // que indexar sea directo.
    int16_t contPc[MAX_PLY + 4] = {0};
    int16_t contZn[MAX_PLY + 4] = {0};
    Value   evalStack[MAX_PLY + 4] = {VALUE_NONE};
    Value qsearch(Position& pos, Value alpha, Value beta, int ply, int qd);
    bool  time_up();

    Histories* hist;
    SearchLimits limits;
    int64_t startTime = 0, hardLimit = 0;
    std::atomic<bool> stopped{false};
    int   rootPly = 0;
    SearchStats statsData;
    TranspositionTable* tt;
    // Todo lo grande va aqui, en heap y por objeto Search. Con `thread_local`
    // MinGW usa emutls y una tabla de 4 MB por hilo hacia fallar la creacion
    // de hilos del datagen (incidente registrado en AUDIT.md).
    struct MoveBuf {
        Move m[MAX_PLY][MAX_MOVES];
        int  score[MAX_PLY][MAX_MOVES];
        int  qscore[MAX_MOVES];
        Move pv[MAX_PLY][MAX_PLY];
        int  pvLen[MAX_PLY];
    };
    MoveBuf* moveBuf;
};

int64_t now_ms();
uint64_t perft(Position& pos, int depth);

}  // namespace tk
