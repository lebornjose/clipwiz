import { PAGRenderer } from './pagRenderer'

import type { IPagRendererOptions } from './pagRenderer'

export type IRendererOptions = IPagRendererOptions

export function createRenderer(options: IRendererOptions) {
    return new PAGRenderer(options)
}

export { PAGRenderer } from './pagRenderer'
