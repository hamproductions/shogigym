#include "nnue.h"

#include <algorithm>
#include <cstdio>
#include <cstring>
#include <fstream>
#include <vector>

namespace tk {

namespace {

struct Net {
    bool loaded = false;
    std::string id;
    std::vector<int16_t> ft;                 // [NNUE_DIMS][L1]
    std::vector<int32_t> ftBias;             // [L1]
    std::vector<int32_t> psqt;               // [NNUE_DIMS][OUT_BUCKETS]
    // stacks por bucket de salida
    std::vector<int8_t>  fc0;                // [OB][256*16]
    std::vector<int32_t> b0;                 // [OB][16]
    std::vector<int8_t>  fc1;                // [OB][16*32]
    std::vector<int32_t> b1;                 // [OB][32]
    std::vector<int8_t>  fc2;                // [OB][32]
    std::vector<int32_t> b2;                 // [OB]
};
Net net;

struct Acc {
    int32_t v[2][NNUE_L1];
    int32_t psqt[2][NNUE_OUT_BUCKETS];
};
thread_local Acc accStack[MAX_PLY + 8];
thread_local int accTop = 0;

inline int clipped(int x) {
    x >>= NNUE_FT_SHIFT;
    return x < 0 ? 0 : (x > 127 ? 127 : x);
}

void add_feature(Acc& a, int persp, int idx) {
    const int16_t* w = &net.ft[size_t(idx) * NNUE_L1];
    for (int i = 0; i < NNUE_L1; ++i) a.v[persp][i] += w[i];
    const int32_t* p = &net.psqt[size_t(idx) * NNUE_OUT_BUCKETS];
    for (int b = 0; b < NNUE_OUT_BUCKETS; ++b) a.psqt[persp][b] += p[b];
}

void sub_feature(Acc& a, int persp, int idx) {
    const int16_t* w = &net.ft[size_t(idx) * NNUE_L1];
    for (int i = 0; i < NNUE_L1; ++i) a.v[persp][i] -= w[i];
    const int32_t* p = &net.psqt[size_t(idx) * NNUE_OUT_BUCKETS];
    for (int b = 0; b < NNUE_OUT_BUCKETS; ++b) a.psqt[persp][b] -= p[b];
}

void refresh(Acc& a, const Position& pos) {
    for (int p = 0; p < 2; ++p) {
        for (int i = 0; i < NNUE_L1; ++i) a.v[p][i] = net.ftBias[i];
        for (int b = 0; b < NNUE_OUT_BUCKETS; ++b) a.psqt[p][b] = 0;
    }
    for (int c = 0; c < NCELL; ++c) {
        int o = pos.color_on(c);
        if (o < 0) continue;
        int pt = pos.piece_on(c), sq = sqOfCell(c);
        add_feature(a, BLACK, nnue_feature(BLACK, pt, o, sq));
        add_feature(a, WHITE, nnue_feature(WHITE, pt, o, sq));
    }
}

// Propaga el acumulador a traves de la red y devuelve (psqt, positional).
void forward(const Acc& a, int stm, int bucket, int32_t& psqtOut, int32_t& posOut) {
    uint8_t in[NNUE_L1 * 2];
    for (int i = 0; i < NNUE_L1; ++i) {
        in[i] = uint8_t(clipped(a.v[stm][i]));
        in[NNUE_L1 + i] = uint8_t(clipped(a.v[stm ^ 1][i]));
    }
    // pairwise: reduce 512 -> 256 multiplicando ambas mitades
    uint8_t pw[NNUE_L1];
    for (int i = 0; i < NNUE_L1; ++i)
        pw[i] = uint8_t((int(in[i]) * int(in[NNUE_L1 + i])) >> 7);

    const int8_t* w0 = &net.fc0[size_t(bucket) * NNUE_L1 * 16];
    int32_t h0[16];
    for (int j = 0; j < 16; ++j) {
        int32_t s = net.b0[bucket * 16 + j];
        for (int i = 0; i < NNUE_L1; ++i) s += int32_t(pw[i]) * w0[i * 16 + j];
        h0[j] = std::max(0, s >> 6);
        if (h0[j] > 127) h0[j] = 127;
    }
    const int8_t* w1 = &net.fc1[size_t(bucket) * 16 * 32];
    int32_t h1[32];
    for (int j = 0; j < 32; ++j) {
        int32_t s = net.b1[bucket * 32 + j];
        for (int i = 0; i < 16; ++i) s += h0[i] * w1[i * 32 + j];
        h1[j] = std::max(0, s >> 6);
        if (h1[j] > 127) h1[j] = 127;
    }
    const int8_t* w2 = &net.fc2[size_t(bucket) * 32];
    int32_t out = net.b2[bucket];
    for (int i = 0; i < 32; ++i) out += h1[i] * w2[i];

    psqtOut = (a.psqt[stm][bucket] - a.psqt[stm ^ 1][bucket]) / 2;
    posOut = out;
}

}  // namespace

bool nnue_loaded() { return net.loaded; }
std::string nnue_id() { return net.id; }
void nnue_unload() { net = Net(); }

// El loader compara magic, version, arch_hash y dims: cualquier diferencia es
// RECHAZO, sin intentar adaptacion, conservando el backend anterior.
bool nnue_load(const std::string& path) {
    std::ifstream f(path, std::ios::binary);
    if (!f) return false;
    char magic[4];
    f.read(magic, 4);
    if (memcmp(magic, "TKN1", 4) != 0) return false;
    uint16_t ver;
    f.read((char*)&ver, 2);
    // v2 anade los umbrales de bucket al propio fichero. v1 se RECHAZA: una
    // red entrenada con otros umbrales elegia un bucket distinto del que elige
    // el motor y evaluaba mal en silencio. El loader lo aceptaba porque los
    // umbrales no estaban en el contrato binario. Incidente en AUDIT.md.
    if (ver != 2) return false;
    unsigned char hash[32];
    f.read((char*)hash, 32);
    uint32_t dims[5];
    f.read((char*)dims, 20);
    if (dims[0] != 1 || int(dims[1]) != NNUE_PLANES || int(dims[2]) != NNUE_L1
        || int(dims[3]) != NNUE_OUT_BUCKETS || int(dims[4]) != NPIECE)
        return false;
    std::vector<uint8_t> cmap(NPIECE);
    f.read((char*)cmap.data(), NPIECE);
    for (int i = 0; i < NPIECE; ++i)
        if (cmap[i] != NNUE_CLASS[i]) return false;      // tabla de clases
    uint16_t th[NNUE_OUT_BUCKETS - 1];
    f.read((char*)th, sizeof(th));
    for (int i = 0; i < NNUE_OUT_BUCKETS - 1; ++i)
        if (th[i] != NNUE_BUCKET_THRESH[i]) return false;  // umbrales de bucket

    Net n;
    n.ft.resize(size_t(NNUE_DIMS) * NNUE_L1);
    n.ftBias.resize(NNUE_L1);
    n.psqt.resize(size_t(NNUE_DIMS) * NNUE_OUT_BUCKETS);
    n.fc0.resize(size_t(NNUE_OUT_BUCKETS) * NNUE_L1 * 16);
    n.b0.resize(NNUE_OUT_BUCKETS * 16);
    n.fc1.resize(size_t(NNUE_OUT_BUCKETS) * 16 * 32);
    n.b1.resize(NNUE_OUT_BUCKETS * 32);
    n.fc2.resize(size_t(NNUE_OUT_BUCKETS) * 32);
    n.b2.resize(NNUE_OUT_BUCKETS);
    f.read((char*)n.ft.data(), n.ft.size() * 2);
    f.read((char*)n.ftBias.data(), n.ftBias.size() * 4);
    f.read((char*)n.psqt.data(), n.psqt.size() * 4);
    f.read((char*)n.fc0.data(), n.fc0.size());
    f.read((char*)n.b0.data(), n.b0.size() * 4);
    f.read((char*)n.fc1.data(), n.fc1.size());
    f.read((char*)n.b1.data(), n.b1.size() * 4);
    f.read((char*)n.fc2.data(), n.fc2.size());
    f.read((char*)n.b2.data(), n.b2.size() * 4);
    if (!f) return false;
    if (f.peek() != EOF) return false;                   // EOF exacto

    char buf[80];
    snprintf(buf, sizeof(buf), "%02x%02x%02x%02x%02x%02x%02x%02x",
             hash[0], hash[1], hash[2], hash[3], hash[4], hash[5], hash[6], hash[7]);
    n.id = buf;
    n.loaded = true;
    net = std::move(n);
    return true;
}

void nnue_reset(const Position& pos) {
    if (!net.loaded) return;
    accTop = 0;
    refresh(accStack[0], pos);
}

void nnue_push(const Position& pos, const Move& m) {
    if (!net.loaded) return;
    if (accTop + 1 >= MAX_PLY + 8) return;   // guarda dura: nunca desbordar
    Acc& cur = accStack[accTop];
    Acc& nxt = accStack[++accTop];
    nxt = cur;
    int cells[64];
    int nc = pos.capture_cells(m, cells);
    for (int i = 0; i < nc; ++i) {
        int pt = pos.piece_on(cells[i]), co = pos.color_on(cells[i]), sq = sqOfCell(cells[i]);
        sub_feature(nxt, BLACK, nnue_feature(BLACK, pt, co, sq));
        sub_feature(nxt, WHITE, nnue_feature(WHITE, pt, co, sq));
    }
    MoveKind k = m.kind();
    int us = pos.side_to_move();
    if (k != IGUI && k != JITTO) {
        int pt = pos.piece_on(m.from());
        int np = m.promo() ? PIECES[pt].promotesTo : pt;
        sub_feature(nxt, BLACK, nnue_feature(BLACK, pt, us, sqOfCell(m.from())));
        sub_feature(nxt, WHITE, nnue_feature(WHITE, pt, us, sqOfCell(m.from())));
        add_feature(nxt, BLACK, nnue_feature(BLACK, np, us, sqOfCell(m.to())));
        add_feature(nxt, WHITE, nnue_feature(WHITE, np, us, sqOfCell(m.to())));
    } else if (m.promo()) {
        int pt = pos.piece_on(m.from());
        int np = PIECES[pt].promotesTo;
        sub_feature(nxt, BLACK, nnue_feature(BLACK, pt, us, sqOfCell(m.from())));
        sub_feature(nxt, WHITE, nnue_feature(WHITE, pt, us, sqOfCell(m.from())));
        add_feature(nxt, BLACK, nnue_feature(BLACK, np, us, sqOfCell(m.from())));
        add_feature(nxt, WHITE, nnue_feature(WHITE, np, us, sqOfCell(m.from())));
    }
}

void nnue_push_null() {
    if (!net.loaded || accTop + 1 >= MAX_PLY + 8) return;
    accStack[accTop + 1] = accStack[accTop];
    accTop++;
}

void nnue_pop() { if (net.loaded && accTop > 0) accTop--; }

static Value finish(const Acc& a, const Position& pos) {
    int bucket = nnue_bucket(pos.piece_count());
    int32_t ps, po;
    forward(a, pos.side_to_move(), bucket, ps, po);
    return Value((ps + po) / NNUE_FV_SCALE);
}

Value nnue_evaluate(const Position& pos) {
    if (!net.loaded) return VALUE_ZERO;
    return finish(accStack[accTop], pos);
}

Value nnue_evaluate_full(const Position& pos) {
    if (!net.loaded) return VALUE_ZERO;
    static thread_local Acc tmp;
    refresh(tmp, pos);
    return finish(tmp, pos);
}

void nnue_debug(const Position& pos, NnueDebug& out) {
    static thread_local Acc tmp;
    refresh(tmp, pos);
    for (int p = 0; p < 2; ++p) out.nActive[p] = 0;
    for (int c = 0; c < NCELL; ++c) {
        int o = pos.color_on(c);
        if (o < 0) continue;
        int pt = pos.piece_on(c), sq = sqOfCell(c);
        for (int p = 0; p < 2; ++p)
            out.active[p][out.nActive[p]++] = nnue_feature(p, pt, o, sq);
    }
    for (int p = 0; p < 2; ++p)
        std::sort(out.active[p], out.active[p] + out.nActive[p]);
    out.bucket = nnue_bucket(pos.piece_count());
    int32_t ps, po;
    forward(tmp, pos.side_to_move(), out.bucket, ps, po);
    out.psqt = ps;
    out.positional = po;
    out.total = (ps + po) / NNUE_FV_SCALE;
}

}  // namespace tk
