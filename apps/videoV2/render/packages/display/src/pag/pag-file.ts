import { IFileModule, IPagFile } from '@van-gogh/video/render/packages/constants'
import { PAGLayer } from './pag-layer'
import { readFile } from '@van-gogh/video-render-core'
import { PAGModule } from './pag-module'
import { writeBufferToWasm } from '../tgfx/web/src/utils/buffer';

export class PAGFile extends PAGLayer implements IPagFile{
  static module: IFileModule


  static readFile = (file: File): Promise<String | ArrayBuffer> =>
    new Promise((resolve) => {
      const reader: any = new FileReader()

      reader.onload = () => {
        resolve(reader.result)
      }

      reader.onerror = () => {
        console.error(reader.error?.message)
      }

      reader.readAsArrayBuffer(file)
    })

  // load from file
  static async load(url: string | File) {
    let localFile = url
    const response = await fetch(url as string)
    const blob = await response.blob()
    localFile = new window.File([blob], (url as string).replace(/(.*\/)*([^.]+)/i, '$2'))
    const buffer = (await readFile(localFile as File)) as ArrayBuffer
    return PAGFile.loadFromBuffer(buffer)
  }


  // load from buffer
  public static loadFromBuffer(buffer: ArrayBuffer) {
    if (!buffer || !(buffer.byteLength > 0)) throw new Error('Initialize PAGFile data not be empty!');
    const { byteOffset, length, free } = writeBufferToWasm(PAGModule, buffer);
    const wasmIns = this.module._PAGFile._Load(byteOffset, length);
    free();
    if (!wasmIns) throw new Error('Load PAGFile fail!');
    const pagFile = new PAGFile(wasmIns);
    return pagFile;
  }

  public static maxSupportedTagLevel(): number {
    return this.module._PAGFile._MaxSupportedTagLevel() as number;
  }

    /**
   * The tag level this pag file requires.
   */
  public tagLevel(): number {
    return this.wasmIns._tagLevel() as number;
  }


  public numTexts(): number {
    return this.wasmIns._numTexts() as number;
  }

    /**
   * The number of replaceable images.
   */
    public numImages(): number {
      return this.wasmIns._numImages() as number;
    }
    /**
     * The number of video compositions.
     */
    public numVideos(): number {
      return this.wasmIns._numVideos() as number;
    }

  constructor(wasmIns: any) {
    super(wasmIns)
  }

  destroy(): void {
    this.wasmIns?.delete()
  }
}
