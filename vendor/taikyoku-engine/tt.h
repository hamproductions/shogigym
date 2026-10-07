// tt.h — tabla de transposición.
//
// R-04: con Move de 64 bits la entrada NO puede ser la de 12 B del chasis.
// Se rediseña a 16 B exactos (clúster de 4 = una línea de caché de 64 B).
#pragma once

#include <cstdlib>
#include <cstring>
#include <new>
#include <vector>

#include "types.h"

namespace tk {

struct TTEntry {
    // ORDEN IMPORTANTE: `Move` son 8 B y exige alineacion de 8. Declarado el
    // primero, la entrada cierra en 16 B exactos; declarado despues de un
    // uint16_t, el compilador mete 6 B de relleno y la entrada crece a 24
    // (+50 % de TT por un orden de campos). Lo caza el static_assert de abajo.
    Move     move;        // 8 B — el Move de 64 bits entero, sin truncar
    uint16_t key16;
    int16_t  value;
    int16_t  eval;
    uint8_t  depth8;
    uint8_t  genBound8;

    Value  value_of() const { return Value(value); }
    Value  eval_of() const { return Value(eval); }
    int    depth() const { return int(depth8) - 1; }
    Bound  bound() const { return Bound(genBound8 & 0x3); }
    bool   is_pv() const { return genBound8 & 0x4; }

    void save(uint64_t k, Value v, bool pv, Bound b, int d, Move m, Value ev,
              uint8_t gen) {
        uint16_t k16 = uint16_t(k);
        if (m || k16 != key16) move = m;
        if (b == BOUND_EXACT || k16 != key16 || d + 4 > depth()) {
            key16 = k16;
            value = int16_t(v);
            eval = int16_t(ev);
            depth8 = uint8_t(d + 1);
            genBound8 = uint8_t(gen | (pv ? 4 : 0) | b);
        }
    }
};
static_assert(sizeof(TTEntry) == 16, "la entrada de TT debe ocupar 16 B");

class TranspositionTable {
public:
    TranspositionTable() = default;
    TranspositionTable(const TranspositionTable&) = delete;
    TranspositionTable& operator=(const TranspositionTable&) = delete;
    ~TranspositionTable() { aligned_free_compat(mem); }

    void resize(size_t mb) {
        size_t newClusterCount = (mb * 1024 * 1024) / sizeof(Cluster);
        if (newClusterCount < 1024) newClusterCount = 1024;
        void* newMem = aligned_alloc_compat(64, newClusterCount * sizeof(Cluster));
        if (!newMem) throw std::bad_alloc();
        aligned_free_compat(mem);
        mem = newMem;
        clusterCount = newClusterCount;
        clear();
    }
    void clear() {
        if (mem) std::memset(mem, 0, clusterCount * sizeof(Cluster));
        generation = 0;
    }
    void new_search() { generation = uint8_t(generation + 8); }

    TTEntry* probe(uint64_t key, bool& found) {
        if (!mem) resize(64);
        TTEntry* e = first(key);
        uint16_t k16 = uint16_t(key);
        for (int i = 0; i < 4; ++i)
            if (e[i].key16 == k16 && e[i].depth8) { found = true; return &e[i]; }
        // reemplazo: la más superficial y vieja
        TTEntry* rep = e;
        for (int i = 1; i < 4; ++i)
            if (rep->depth8 - ((263 + generation - rep->genBound8) & 0xF8)
                > e[i].depth8 - ((263 + generation - e[i].genBound8) & 0xF8))
                rep = &e[i];
        found = false;
        return rep;
    }
    uint8_t gen() const { return generation; }

private:
    struct Cluster { TTEntry e[4]; };
    static void* aligned_alloc_compat(size_t align, size_t size) {
#if defined(_WIN32)
        return _aligned_malloc(size, align);
#else
        void* p = nullptr;
        if (posix_memalign(&p, align, size)) p = nullptr;
        return p;
#endif
    }
    static void aligned_free_compat(void* ptr) {
#if defined(_WIN32)
        _aligned_free(ptr);
#else
        free(ptr);
#endif
    }
    TTEntry* first(uint64_t key) {
        return reinterpret_cast<Cluster*>(mem)[
            (__uint128_t(key) * __uint128_t(clusterCount)) >> 64].e;
    }
    void* mem = nullptr;
    size_t clusterCount = 0;
    uint8_t generation = 0;
};

extern TranspositionTable TT;

}  // namespace tk
