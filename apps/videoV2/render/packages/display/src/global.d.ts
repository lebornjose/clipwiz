declare namespace GlobalMixins {
  interface IBaseLayerOptions {
    startTime?: number
    duration?: number
    active?: boolean
    enabled?: boolean
  }

  interface IVisualLayerOptions extends IBaseLayerOptions, IApplicationOptions {
    width: number
    height: number
    zIndex?: number
    alpha?: number
    isMask?: boolean
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface IWebContainerOptions extends IVisualLayerOptions { }
}
