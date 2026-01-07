export class PAGLayer {
  wasmIns: any

  constructor(wasmIns: any) {
    this.wasmIns = wasmIns
  }

  alpha(): number {
    return this.wasmIns._alpha()
  }
  setAlpha(opacity: number) {
    this.wasmIns._setAlpha(opacity)
  }
  visible(): boolean {
    return this.wasmIns._visible()
  }
  setVisible(visible: boolean) {
    this.wasmIns._setVisible(visible)
  }
  // PAG 内部的
  layerType() {
    return this.wasmIns._layerType()
  }
  // 制作 PAG file 设计师命名的那个层的名字
  layerName(): string {
    return this.wasmIns._layerName()
  }
  layerId(): number {
    return this.wasmIns._uniqueIDCreatedByAE()
  }
  // microseconds
  startTime(): number {
    return this.wasmIns._startTime()
  }
  // microseconds
  duration(): number {
    return this.wasmIns._duration()
  }
  frameRate(): number {
    return this.wasmIns._frameRate()
  }
  uniqueID(): number {
    return this.wasmIns._uniqueID()
  }

  // 之前改是因为黑边问题，现在改回来是 因为获取的宽度是 0，说是黑边问题编导不会只做这样的pag了
  width(): Number {
    return this.wasmIns._width()
    // return this.wasmIns._widthAfterTrans()
  }
  height(): Number {
    return this.wasmIns._height()
    // return this.wasmIns._heightAfterTrans()
  }
  editableIndex(): number {
    return this.wasmIns._editableIndex()
  }

  localTimeToGlobal(localTime: number): number {
    return this.wasmIns._localTimeToGlobal(localTime)
  }
  globalToLocalTime(globalTime: number): number {
    return this.wasmIns._globalToLocalTime(globalTime)
  }

  destroy(): void {
    this.wasmIns?.delete()
  }
}

export class PAGImageLayer extends PAGLayer {
  constructor(wasmIns: any) {
    super(wasmIns)
  }

  resetImage() {
    this.wasmIns._resetImage()
  }

  replaceImage(nativeImageIns: any) {
    this.wasmIns._replaceImage(nativeImageIns)
  }

  imageWidth(): number {
    const width = this.wasmIns._getPAGImageW()
    return width
  }
  imageHeight(): number {
    const height = this.wasmIns._getPAGImageH()
    return height
  }
}

export class PAGTextLayer extends PAGLayer {
  constructor(wasmIns: any) {
    super(wasmIns)
  }

  text(): string {
    return this.wasmIns._text()
  }
  setText(str: string) {
    this.wasmIns._setText(str)
  }

  // TextDocument
  getTextData() {
    return this.wasmIns._getTextData()
  }

  fillColor() {
    return this.wasmIns._fillColor()
  }
  // struct Color {
  //   uint8_t red, green, blue;  // in the range [0 - 255]
  // };
  setFillColor(clr: any) {
    this.wasmIns._setFillColor(clr)
  }

  fontSize(): number {
    return this.wasmIns._fontSize()
  }
  setFontSize(ftSize: number) {
    this.wasmIns._setFontSize(ftSize)
  }

  strokeColor() {
    return this.wasmIns._strokeColor()
  }
  // struct Color {
  //   uint8_t red, green, blue;  // in the range [0 - 255]
  // };
  setStrokeColor(clr: any) {
    this.wasmIns._setStrokeColor(clr)
  }

  setTextAttribute({
    strokeWidth = null,
    fauxBold = null,
    leading = null,
    tracking = null,
    fauxItalic = null,
    fontFamily = null,
  }) {
    const textDoc: any = this.wasmIns._createDocumentByCopy()
    if (strokeWidth) {
      textDoc.strokeWidth = strokeWidth
    } else if (fauxBold) {
      textDoc.fauxBold = fauxBold
    } else if (leading) {
      textDoc.leading = leading
    } else if (tracking) {
      textDoc.tracking = tracking
    } else if (fauxItalic) {
      textDoc.fauxItalic = fauxItalic
    } else if (fontFamily) {
      textDoc.fontFamily = fontFamily
    }
    this.wasmIns._replaceTextInternal(textDoc)
  }

  // 富文本多端字体
  setRichText(arr: Array<any>) {
    const textLys = this.wasmIns._createRichTextBySize(arr.length, '')
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i]
      const textLy = textLys.get(i)
      const textDoc = textLy._createDocumentByCopy()
      for (let child in item) {
        textDoc[child] = item[child]
      }
      textLy._replaceTextInternal(textDoc)
    }
  }

  getStrokeSize() {
    this.wasmIns._getStrokeSize()
  }

  // 获取文字首帧拖图片
  getReadPixelsAtFrimeFrame() {
    return this.wasmIns?._readPixelsAtFrimeFrame
  }

  getOrCreateDropShadowToLayer() {
    this.wasmIns._getOrCreateDropShadowToLayer()
  }
  // 设置字体阴影
  setDropShadowColor(clr: any) {
    this.wasmIns._setDropShadowColor(clr)
  }
  // 设置阴影透明度
  setDropShadowOpacity(opacity: number) {
    this.wasmIns._setDropShadowOpacity(opacity)
  }
  // 设置阴影角度
  setDropShadowAngle(angle: number) {
    this.wasmIns._setDropShadowAngle(angle)
  }
  // 设置阴影距离
  setDropShadowDistance(distance: any) {
    this.wasmIns._setDropShadowSize(distance)
  }
  setDropShadowSize(size: number) {
    this.wasmIns._setDropShadowSize(size)
  }
}
