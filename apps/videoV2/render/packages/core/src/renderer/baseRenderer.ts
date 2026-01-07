import { RENDERER_TYPE } from '@van-gogh/video-render-constants'

interface BaseRendererPluginsProps {
    [key: string]: any
}

export class BaseRenderer {
    readonly options?: GlobalMixins.IApplicationOptions

    readonly plugins
    readonly screen
    readonly type: RENDERER_TYPE
    readonly resolution: number

    view: HTMLCanvasElement
    // 标识是离屏渲染
    offline: Boolean = false

    useContextAlpha: boolean
    backgroundColor: string
    backgroundAlpha: number

    constructor(type: RENDERER_TYPE = RENDERER_TYPE.UNKNOWN, options?: any) {
        this.type = type

        this.options = options

        this.screen = {
            width: options.width,
            height: options.height,
        }
        this.view = options.view || document.createElement('canvas')
        // 标识是离屏渲染
        this.offline = !options.view
        this.resolution = options.resolution || window.devicePixelRatio || 1

        this.useContextAlpha = options.useContextAlpha
        this.backgroundColor = options.backgroundColor || '#000'
        this.backgroundAlpha = options.backgroundAlpha

        this.plugins = {} as BaseRendererPluginsProps
    }
    // @ts-ignore
    get width(): number {
        return this.view.width
    }
    // @ts-ignore
    get height(): number {
        return this.view.height
    }

    initPlugins(pluginObj: BaseRendererPluginsProps): void {
        for (const o in pluginObj) {
            this.plugins[o] = new pluginObj[o](this)
        }
    }

    // rewritten by subclasses
    resize(targetW: number, targetH: number) {
        this.view.width = Math.round(targetW * this.resolution)
        this.view.height = Math.round(targetH * this.resolution)

        this.view.style.width = `${targetW}px`
        this.view.style.height = `${targetH}px`

        this.screen.width = targetW
        this.screen.height = targetH
    }

    render() { }

    clear() { }

    async updateView(view?: HTMLCanvasElement | null) {
        this.view = view || document.createElement('canvas')
        return this.view
    }

    destroy() {
        for (const o in this.plugins) {
            this.plugins[o].destroy()
            this.plugins[o] = null
        }

        const thisAny = this as any

        thisAny.plugins = null
        thisAny.type = RENDERER_TYPE.UNKNOWN
        thisAny.view = null
        thisAny.screen = null
    }
}
