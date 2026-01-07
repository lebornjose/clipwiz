declare namespace GlobalMixins {
    interface Application {
        stage: any
        renderer: any
        fontManager: any
    }
    interface IApplicationOptions {
        width: number
        height: number
        view: HTMLCanvasElement
        resolution?: number
        wasmUrl?: string
        pagEnabled?: boolean
        useAudio?: boolean
        // 字体配置文件地址
        fontConfigUrl?: string
        useFont?: Boolean
        // 渲染帧序列
        useFrames?: boolean
        // 资源加载管理器
        useLoader?: boolean
        // 背景音乐的音量
        bgmVolume?: number
        type?: number
        videoCtx?: IVideoCtx
    }

    interface IBaseRenderOptions extends IApplicationOptions {
        backgroundColor?: number
        backgroundAlpha?: number
    }

    // WASM
    interface IModule extends WebAssembly.Module {
        VectorString: any
        _PAGFont: {
          _SetFallbackFontNames: (name: string[]) => void
        }
    }

    interface IVisualLayerOptions {

    }

}

