import { FramingPAGRenderer } from './framingRenderer'

import type { IPagRendererOptions } from './framingRenderer'

export type IRendererOptions = IPagRendererOptions

export function framingCreateRenderer(options: IRendererOptions) {
    return new FramingPAGRenderer(options)
}

export { FramingPAGRenderer } from './framingRenderer'
