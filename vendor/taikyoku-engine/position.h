// position.h — tablero, generación de movimientos, do/undo, Zobrist, TSN.
// Reglas: TAIKYOKU_SPEC.md (única autoridad). Los átomos vienen de
// rules_data.h, generado del MISMO artefacto normativo que los oráculos.
#pragma once

#include <string>
#include <vector>

#include "types.h"

namespace tk {

extern uint64_t ZOB[NPIECE][2][NSQ];
extern uint64_t ZOB_SIDE;
void init_tables();

// Multicaptura: la captura a distancia retira hasta 35 piezas de una jugada,
// propias incluidas. StateInfo guarda solo una ventana en una pila lateral.
struct Captured { int16_t cell; int16_t piece; int8_t color; };

struct StateInfo {
    // `previous` NO es adorno: sin el, undo_move lee el StateInfo del HIJO
    // (el ultimo que hizo do_move) en vez del propio, porque cada nivel de la
    // busqueda declara su StateInfo local y nadie restaura el puntero al
    // volver. Bug real detectado por la discrepancia de perft(3). Ver AUDIT.md.
    StateInfo* previous;
    uint64_t key;
    int      capBase, capCount;
    int16_t  promotedFrom;     // tipo previo si hubo promoción, si no -1
    Move     move;
    int      movedPiece;
    Value    eval;
};

class Position {
public:
    Position() { clear(); }

    void clear();
    void set_start();
    bool set_tsn(const std::string& tsn);
    std::string tsn() const;

    int  gen_moves(Move* out) const;                 // pseudo-legal == legal
    int  gen_moves(Color side, Move* out);
    void gen_controls(Color side, std::vector<Move>& out);
    int  gen_captures(Move* out) const;              // solo las que capturan
    void do_move(const Move& m, StateInfo& st);
    void undo_move(const Move& m);
    void do_null(StateInfo& st);
    void undo_null();

    int  capture_cells(const Move& m, int* cells) const;
    bool is_capture(const Move& m) const;
    Value see_value(const Move& m) const;            // material que gana/pierde

    int   piece_on(int c) const { return board[c]; }
    int   color_on(int c) const { return owner[c]; }
    Color side_to_move() const { return Color(stm); }
    uint64_t key() const { return zkey; }
    int   game_ply() const { return gamePly; }
    int   royals(Color c) const { return royalCnt[c]; }
    int   piece_count() const { return pieceCnt; }
    Value material(Color c) const { return mat[c]; }
    // Termino posicional incremental: recorrer las 1.936 casillas por nodo
    // costaba mas que todo el resto de la evaluacion junta.
    Value advance(Color c) const { return adv[c]; }

    // Terminal: la partida acaba al capturar el último real (SPEC §7.2).
    bool  is_terminal() const { return royalCnt[0] == 0 || royalCnt[1] == 0; }
    bool  lost(Color c) const { return royalCnt[c] == 0; }
    bool  is_repetition(int rootPly) const;
    // Regla de PARTIDA (SPEC §7.3 [SUPUESTO]): la CUARTA aparicion de la misma
    // posicion son tablas. Distinta de is_repetition(), que es la deteccion
    // barata de ciclos DENTRO del arbol de busqueda.
    int   repetition_count() const;

    void  put(int c, int pt, int col);
    void  take(int c);

    static int16_t dirDelta[NDIR][2];

private:
    template <bool CapturesOnly, bool Controls = false> int generate(Move* out, std::vector<Move>* controls = nullptr) const;

    int16_t board[NCELL];
    int8_t  owner[NCELL];
    int     stm = 0, gamePly = 0;
    uint64_t zkey = 0;
    int     royalCnt[2] = {0, 0};
    int     pieceCnt = 0;
    Value   mat[2] = {0, 0};
    Value   adv[2] = {0, 0};

public:
    // Tabla de deduplicacion POR POSICION (una Position por hilo), no
    // thread_local: con MinGW/emutls las TLS grandes en hilos creados con
    // std::thread reventaban el datagen multihilo (AUDIT.md).
    static constexpr int DEDUP_BITS = 15;          // 32768 >> branching real
    static constexpr int DEDUP_SIZE = 1 << DEDUP_BITS;
    mutable std::vector<uint64_t> dedupKey;
    mutable std::vector<uint32_t> dedupStamp;
    mutable uint32_t dedupGen = 0;

    std::vector<Captured> capStack;
    std::vector<uint64_t> keyHist;     // para repetición (sennichite)
    StateInfo* st = nullptr;
};

}  // namespace tk
