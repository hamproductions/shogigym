// types.h — tipos núcleo del motor. Contrato congelado: docs/port-1296-design.md
#pragma once

#include <cstdint>
#include <cstdlib>

#include "rules_data.h"

namespace tk {

// ---------------------------------------------------------------- geometría
// Mailbox acolchado: el borde de 4 mata todo bucle de rayo SIN comparación de
// límites. 4 porque el mayor salto de la variante es (4,4) — grulla de montaña
// y águila libre.
constexpr int PAD = 4;
constexpr int W = 36 + 2 * PAD;          // 44
constexpr int NCELL = W * W;             // 1936
constexpr int NSQ = 36 * 36;             // 1296 (índice lógico)
constexpr int WALL = -2, EMPTY_SQ = -1;

constexpr int cellOf(int f, int r) { return (r - 1 + PAD) * W + (f - 1 + PAD); }
constexpr int fileOfCell(int c) { return c % W - PAD + 1; }
constexpr int rankOfCell(int c) { return c / W - PAD + 1; }
constexpr int sqOfCell(int c) { return (rankOfCell(c) - 1) * 36 + fileOfCell(c) - 1; }
constexpr int cellOfSq(int s) { return cellOf(s % 36 + 1, s / 36 + 1); }
constexpr int deltaOf(int df, int dr) { return dr * W + df; }

enum Color : int { BLACK = 0, WHITE = 1, COLOR_NB = 2 };
constexpr Color operator~(Color c) { return Color(c ^ 1); }

// ------------------------------------------------------------------- Move64
// El Move de 64 bits NO es opcional: los movimientos de área (dos pasos), el
// igui (capturar sin moverse) y la esquina del gancho exigen una casilla
// intermedia. Sin `mid` la jugada no se puede deshacer.
enum MoveKind : uint8_t {
    NORMAL = 0, AREA2, IGUI, JITTO, HOOK, JUMPSLIDE, HOP, RANGECAP
};

struct Move {
    uint64_t v = 0;
    constexpr Move() = default;
    constexpr Move(int from, int to, int mid, MoveKind k, bool promo)
        : v(uint64_t(to & 0x7FF) | (uint64_t(from & 0x7FF) << 11)
            | (uint64_t((mid < 0 ? 0x7FF : mid) & 0x7FF) << 22)
            | (uint64_t(promo) << 33) | (uint64_t(k) << 34)) {}
    constexpr int to() const { return int(v & 0x7FF); }
    constexpr int from() const { return int((v >> 11) & 0x7FF); }
    constexpr int mid() const { int m = int((v >> 22) & 0x7FF); return m == 0x7FF ? -1 : m; }
    constexpr bool promo() const { return (v >> 33) & 1; }
    constexpr MoveKind kind() const { return MoveKind((v >> 34) & 0xF); }
    constexpr bool operator==(const Move& o) const { return v == o.v; }
    constexpr bool operator!=(const Move& o) const { return v != o.v; }
    constexpr explicit operator bool() const { return v != 0; }
    static constexpr Move none() { return Move(); }
    // null(): from==to==0 no es codificable como jugada real (una casilla del
    // borde), así que sirve de centinela sin colisionar.
    static constexpr Move null() { return Move(0, 0, -1, JITTO, false); }
};
static_assert(sizeof(Move) == 8, "Move debe ocupar 64 bits");
// R-04: PROHIBIDO empaquetar una casilla en menos de 11 bits, en ningún sitio.
static_assert(NCELL <= (1 << 11), "la casilla no cabe en 11 bits");
static_assert(NPIECE <= (1 << 9), "el tipo de pieza no cabe en 9 bits");

constexpr int MAX_MOVES = 8192;   // branching máximo medido: 1.254; margen x6
constexpr int MAX_PLY = 128;

// ------------------------------------------------------------------- Value
using Value = int;
constexpr Value VALUE_ZERO = 0;
constexpr Value VALUE_DRAW = 0;
constexpr Value VALUE_INFINITE = 32001;
constexpr Value VALUE_NONE = 32002;
// Terminal por captura del último real: no hay mate, pero se conserva la escala
// de "mate" para que la búsqueda prefiera ganar antes.
constexpr Value VALUE_WIN = 30000;
constexpr Value VALUE_WIN_IN_MAX_PLY = VALUE_WIN - MAX_PLY;

constexpr bool is_win(Value v) { return v >= VALUE_WIN_IN_MAX_PLY; }
constexpr bool is_loss(Value v) { return v <= -VALUE_WIN_IN_MAX_PLY; }
constexpr bool is_decisive(Value v) { return is_win(v) || is_loss(v); }

enum Bound : uint8_t { BOUND_NONE = 0, BOUND_UPPER, BOUND_LOWER, BOUND_EXACT };

// --------------------------------------------- bucketing (presupuesto de RAM)
// Sin bucketing, ContinuationHistory sería (1024*1296)^2 * 2 B ~ 3,6 EB y
// CapturePieceToHistory 800 GB. Ver docs/port-1296-design.md §6.
constexpr int PIECE_CLASSES = 32;      // clases de pieza para historiales
constexpr int ZONE_SIDE = 6;           // el tablero se parte en 6x6 zonas...
constexpr int NZONE = ZONE_SIDE * ZONE_SIDE;   // ...de 6x6 casillas = 36 zonas

inline int piece_class(int pt) {
    // Agrupación estable y documentada: los reales y los de captura a distancia
    // tienen clase propia (su semántica es única); el resto se reparte por
    // valor, que ya resume familia de movimiento y movilidad.
    if (PIECES[pt].royal) return 0;
    if (PIECES[pt].rankCap <= 4) return 1;
    int v = PIECES[pt].value;                       // 0..1225
    int k = 2 + v * (PIECE_CLASSES - 2) / 1226;
    return k < PIECE_CLASSES ? k : PIECE_CLASSES - 1;
}

inline int zone_of(int cell) {
    int f = (fileOfCell(cell) - 1) / ZONE_SIDE;
    int r = (rankOfCell(cell) - 1) / ZONE_SIDE;
    return r * ZONE_SIDE + f;
}

}  // namespace tk
