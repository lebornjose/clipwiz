import { IAudioNode, IPhotoNode, IVideoNode } from "@clipwiz/shared";

export type SourceElement =
    | HTMLCanvasElement
    | HTMLImageElement
    | HTMLVideoElement;

  export type WebglContextAttributes = {
    preserveDrawingBuffer: boolean;
    alpha: boolean;
  };

  export type Options = {
    preserveDrawingBuffer: boolean;
    manualUpdate: boolean;
    endOnLastSourceEnd: boolean;
    useVideoElementCache: boolean;
    videoElementCacheSize: number;
    webglContextAttributes: WebglContextAttributes;
  };

  export type Definitions = {
    title: string;
    description: string;
    vertexShader: string;
    fragmentShader: string;
    properties: any;
    inputs: String[];
  }

  export class DestinationNode {
    // todo
  }

  export class RenderGraph {
    // todo
  }

  export class EffectNode {
    // todo
  }

  export class CompositingNode {
    // todo
  }

  export class TransitionNode {
    // todo
  }

  export class GraphNode {
    // todo
    public connect(targetNode: any): boolean;
  }

  export class SourceNode extends GraphNode {
    constructor(
      src: string | SourceElement,
      gl: WebGLRenderingContext,
      renderGraph: RenderGraph,
      currentTime: number
    );

    playbackRate:number
    element(): SourceElement;
    duration(): number;

    stretchPaused(stretchPaused: boolean): void;
    stretchPaused(): boolean;

    _load(): void;
    _unload(): void;

    registerCallback(type: string, func: Function): void;
    unregisterCallback(func: Function): void;

    _triggerCallbacks<T>(type: string, data: T): void;

    start(time: number): boolean;
    startAt(time: number): boolean;
    startTime(): number;
    stop(time: number): boolean;
    stopAt(time: number): boolean;
    stopTime(): number;

    _seek(time: number): void;
    volume(volume: number) :void

    _pause(): void;
    _play(): void;

    _isReady(): boolean;
    _update(currentTime: number, triggerTextureUpdate: boolean): boolean;

    clearTimelineState(): void;
    destroy(): void;
  }

  export class VideoNode extends SourceNode {
    constructor(
      src: string | SourceElement,
      gl: WebGLRenderingContext,
      renderGraph: RenderGraph,
      globalPlaybackRate: number,
      sourceOffset: number,
      preloadTime: number,
      videoElementCache: number,
      attributes: object
    );

    playbackRate(playbackRate: number): void;
    stretchPaused(stretchPaused: boolean): void;
    stretchPaused(): boolean;

    playbackRate(): number;
    elementURL(): string;

    volume(volume: number): void;

    _load(): void;
    _unload(): void;

    _seek(time: number): void;
    _update(currentTime: number): boolean;
    clearTimelineState(): void;
    destroy(): void;
  }

  export class ImageNode extends SourceNode {
    constructor(
      src: string | SourceElement,
      gl: WebGLRenderingContext,
      renderGraph: RenderGraph,
      currentTime: number,
      preloadTime: number,
      attribites: object
    );

    elementURL(): string;

    _load(): void;
    _unload(): void;
    _seek(time: number): void;
    _update(currentTime: number): boolean;
  }

  export class CanvasNode extends SourceNode {
    constructor(
      src: string | SourceElement,
      gl: WebGLRenderingContext,
      renderGraph: RenderGraph,
      currentTime: number,
      preloadTime: number
    );

    _load(): void;
    _unload(): void;
    _seek(time: number): void;
    _update(currentTime: number): boolean;
  }

declare class VideoContext {
  constructor (canvas: HTMLCanvasElement)
  registerCallback(type: string, func: Function): void
  unregisterCallback(func: Function): void
  currentTime: number
  duration: number
  state: number
  pause(): void
  reset(): void
  play(): void
  audio(url:string,fromTime:number,preload:number,options:{volume:number}): IAudioNode
  volume: number
  _sourceNodes: []
  registerTimelineCallback(
    time: number,
    func: Function,
    ordering: number
  ): void;
  unregisterTimelineCallback(func: Function): void;

  registerCallback(type: string, func: Function): void;
  unregisterCallback(func: Function): void;

  element(): SourceElement;

  state(): number;

  duration(): number;

  currentTime: number;

  destination(): DestinationNode;

  playbackRate: number;

  volume: number;

  play(): boolean;

  pause(): boolean;

  video(
    src: string | SourceElement,
    sourceOffset?: number,
    preloadTime?: number,
    videoElementAttributes?: object
  ): IVideoNode;

  image(
    src: string
  ): IPhotoNode;

  canvas(canvas: HTMLCanvasElement): IPhotoNode;

  effect(definition: Definitions): EffectNode;

  compositor(definition: Definitions): CompositingNode;

  transition(definition: Definitions): TransitionNode;

  reset(): void;

  snapshot(): VideoContext;
}
export default VideoContext

