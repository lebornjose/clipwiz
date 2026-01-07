export class PagContainer {
  app: any
  module: any
  public pagFile!: any
  public pagFileIns!: any
  private pagFilePath: string | File = ''
  private cache = new Map<string | File, Promise<ArrayBuffer>>()

  bindModules(module: any) {
    this.module = module
  }

  async fetchFile(url: string): Promise<ArrayBuffer> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!
    } else {
      const fetchPromise = (async () => {
        const response = await fetch(url as string)
        const buffer = await response.arrayBuffer()
        return buffer
      })()
      this.cache.set(url, fetchPromise)
      return fetchPromise
    }
  }

  // ------ 添加文件 ------
  async addFile(url: string) {
    this.clear()
    const buffer = await this.fetchFile(url)
    const pagFileIns = await this.module.PAGFile.load(buffer)
    this.pagFilePath = url
    return pagFileIns
  }

  removeFile() {
    this.clear()
  }

  // 获取上传的文件路径，用于 offscreen rerender
  getFilePath() {
    return this.pagFilePath
  }

  // ---- clean up ----
  clear() {
    this.pagFileIns?.destroy()
    this.pagFileIns = null
    this.pagFilePath = ''
  }

  destroy() {
    this.pagFileIns?.destroy()
    this.pagFileIns = null
    this.pagFilePath = ''
  }
}
