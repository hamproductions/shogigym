// nnue.h — red S de Taikyoku. Contrato congelado: docs/nnue-taikyoku-s.md
//
// Dos decisiones que separan esta red de la de Terachess, ambas con ADR-008:
//   1. SIN ancla de rey. Con hasta 3 reales por bando el ancla esta mal
//      definida y crearia aliasing al morir el "real primario". Los buckets de
//      salida y un factor real-relativo train-only hacen ese trabajo.
//   2. Acumulador i32. Con hasta 804 features activas la cota i16 de Terachess
//      obligaria a recortar los pesos a +-30 (5 bits utiles). Cota nueva:
//      804 * 32.767 + 8.191 = 26.352.859 << 2^31.  Margen 81x por construccion.
#pragma once

#include <cstdint>
#include <string>

#include "position.h"

namespace tk {

constexpr int NNUE_L1 = 256;
constexpr int NNUE_OUT_BUCKETS = 8;
constexpr int NNUE_PLANES = 2 * NNUE_CLASSES;              // propias + rivales
constexpr int NNUE_DIMS = NNUE_PLANES * NSQ;
constexpr int NNUE_FT_SHIFT = 6;
constexpr int NNUE_FV_SCALE = 16;
constexpr int NNUE_MAX_ACTIVE = 804;

// La cota anti-overflow, demostrada por construccion y comprobada por el
// compilador: nunca depende de la suerte del entrenamiento.
static_assert(int64_t(NNUE_MAX_ACTIVE) * 32767 + 8191 < (int64_t(1) << 31),
              "el acumulador i32 debe cubrir el peor caso de 804 activas");

// Indice de feature. `persp` es el color desde el que se mira.
// La orientacion es rotacion de 180 grados: es la simetria real del setup.
inline int nnue_feature(int persp, int pt, int col, int sq) {
    int cls = NNUE_CLASS[pt];
    int plane = (col == persp) ? cls : (NNUE_CLASSES + cls);
    int vsq = (persp == BLACK) ? sq : (NSQ - 1 - sq);
    return plane * NSQ + vsq;
}

// Umbrales CALIBRADOS con la distribucion real de una campana, no repartidos
// a ojo: con `(pieceCount-1)/101` tres buckets se quedaban por debajo del 1 %
// de los datos. Ver tools/calibrate_buckets.py y rules/output_buckets.json.
inline int nnue_bucket(int pieceCount) {
    for (int i = 0; i < NNUE_OUT_BUCKETS - 1; ++i)
        if (pieceCount < NNUE_BUCKET_THRESH[i]) return i;
    return NNUE_OUT_BUCKETS - 1;
}

bool  nnue_load(const std::string& path);
bool  nnue_loaded();
void  nnue_unload();
std::string nnue_id();

// Camino AUTORITATIVO: refresco completo. Simple e independiente, es el oraculo
// contra el que se prueba el incremental (playbook doc 6).
Value nnue_evaluate_full(const Position& pos);
// Camino rapido: acumulador incremental mantenido por la busqueda.
Value nnue_evaluate(const Position& pos);

void nnue_reset(const Position& pos);
void nnue_push(const Position& posBefore, const Move& m);
void nnue_push_null();
void nnue_pop();

// Volcado para el gate de paridad motor<->python (tolerancia 0 cp).
struct NnueDebug {
    int nActive[2];
    int active[2][NNUE_MAX_ACTIVE];
    int32_t psqt, positional, total, bucket;
};
void nnue_debug(const Position& pos, NnueDebug& out);

}  // namespace tk
