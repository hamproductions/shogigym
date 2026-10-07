// shogigym: thin C API over the UCI handler, for the WebAssembly build.
#include <emscripten.h>
#include <string>

namespace tk {
void uci_init();
bool uci_handle(const std::string& line);
}  // namespace tk

extern "C" {
EMSCRIPTEN_KEEPALIVE void tk_init() { tk::uci_init(); }
EMSCRIPTEN_KEEPALIVE int tk_command(const char* line) { return tk::uci_handle(line) ? 1 : 0; }
}
