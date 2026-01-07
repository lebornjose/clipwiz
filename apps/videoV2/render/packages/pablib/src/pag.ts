import './utils/polyfills'
import videoRendererWasmV2 from '@van-gogh/wasm-video-adapter-v2'
import { PAGBind } from './binding'
import * as types from './types'
import { WebAssemblyQueue } from './utils/queue'
import { workerInit } from './worker/worker'
import { WORKER } from './utils/ua'

export interface ModuleOption {
  /**
   * Link to wasm file.
   */
  locateFile?: (file: 'libpag.wasm') => string
}

/**
 * Initialize pag webassembly module.
 */
const PAGInit = (moduleOption: ModuleOption = {}): Promise<types.PAG> =>
  // (window as any).videoRendererWasmV2()
    videoRendererWasmV2()
    .then((module: types.PAG) => {
      PAGBind(module)
      module.webAssemblyQueue = new WebAssemblyQueue()
      module.globalCanvas = new module.GlobalCanvas()
      module.PAGFont.registerFallbackFontNames()
      return module
    })
    .catch((error: any) => {
      console.error(error)
      throw new Error('PAGInit fail! Please check .wasm file path valid.')
    })

if (WORKER) {
  workerInit(PAGInit)
}

export { PAGInit, types }
