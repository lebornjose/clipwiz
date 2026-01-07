import { PagContainer } from './pagContainer'

export function createContainer(options: GlobalMixins.IVisualLayerOptions): PagContainer {
    return new PagContainer()
}

export { FontManager } from './font'
export type { IFontManager } from './font'

export { PagContainer } from './pagContainer'

// export { PAGFile } from './pag/pag-file'
