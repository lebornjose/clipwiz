import { PAGInit } from 'libpag';
const url = 'https://mogic-algo-data.oss-cn-hangzhou.aliyuncs.com/yuxiaopu/Dependencies/%E5%B0%8F%E7%B1%B3%E7%99%BD%E5%AD%97%E9%BB%91%E6%8F%8F%E8%BE%B9.pag';
class PagNode {
  PAG: any | null
  pagCanvas: HTMLCanvasElement
  width: number
  height: number
  pagUrl: string
  pag: any
  pagView: any
  pagFile: any
  textLayers: any[]
  isReady: boolean
  constructor() {
    this.width = 1280
    this.height = 720
    this.pagCanvas = document.createElement('canvas')
    this.pagCanvas.width = this.width
    this.pagCanvas.height = this.height
    this.pagCanvas.style.width = this.width + 'px'
    this.pagCanvas.style.height = this.height + 'px'
    this.pagCanvas.id = 'pag';
    this.pagUrl = url
    this.pagView = null
    this.pagFile = null
    this.textLayers = []
    this.isReady = false
    this.PAG = null
    this.init()
  }

  async init() {
    try {
      // 配置 WASM 文件路径
      this.PAG = await PAGInit({
        locateFile: (file: string) => {
          // 假设 libpag.wasm 在 public 目录下
          if (file.endsWith('.wasm')) {
            return '/libpag.wasm';
          }
          return file;
        }
      });

      const buffer = await fetch(url).then((response) => response.arrayBuffer());

      this.pagFile = await this.PAG.PAGFile.load(buffer);

      this.pagCanvas.width = this.pagFile.width();
      this.pagCanvas.height = this.pagFile.height();

      this.pagView = await this.PAG.PAGView.init(this.pagFile, this.pagCanvas);


      // 初始化完成后查找文本图层
      this.findTextLayers(this.pagFile);

      this.isReady = true;
      // document.body.append(canvas);
      console.log('PAG 初始化成功，找到文本图层数量:', this.textLayers.length);
    } catch (error) {
      console.error('PAG 初始化失败:', error);
      // 不抛出错误，让应用继续运行
      console.warn('字幕功能暂时不可用，但不影响其他功能');
      this.isReady = false;
    }
  }

    // 递归查找所有文本图层
    findTextLayers(composition: any) {
      const numChildren = composition.numChildren();
      for (let i = 0; i < numChildren; i++) {
          const layer = composition.getLayerAt(i);

          // 检查是否是文本图层 (layerType === 3)
          if (layer.layerType() === 3) {
              this.textLayers.push(layer);
          }
          // 如果是组合图层，递归查找
          if (layer.numChildren && layer.numChildren() > 0) {
              this.findTextLayers(layer);
          }
      }
  }
  updateTextLayers(text: string) {
    if (!this.isReady) {
      console.warn('PAG 尚未初始化完成，无法更新文本');
      return;
    }

    if (this.textLayers.length === 0) {
      console.warn('未找到文本图层');
      return;
    }

    const textLayer = this.textLayers[0];
    console.log("修改前的文本:", textLayer.text());
    textLayer.setText(text);

    // 更新视图
    if (this.pagView) {
      this.pagView.flush();
    }
  }

  // 等待初始化完成
  async waitForReady() {
    if (this.isReady) return;

    return new Promise<void>((resolve) => {
      const checkReady = setInterval(() => {
        if (this.isReady) {
          clearInterval(checkReady);
          resolve();
        }
      }, 100);

      // 最多等待 10 秒
      setTimeout(() => {
        clearInterval(checkReady);
        resolve();
      }, 10000);
    });
  }
}

export default PagNode
