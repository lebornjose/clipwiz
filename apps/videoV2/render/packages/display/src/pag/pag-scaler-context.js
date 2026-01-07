import { getCanvas2D } from '../tgfx/web/src/wechat/canvas'

class ScalerContext {
  constructor(fontName, fontStyle, size) {
    this.fontBoundingBoxMap = [];
    this.fontName = fontName;
    this.fontStyle = fontStyle;
    this.size = size;
    this.loadCanvas();
  }
  static setCanvas(canvas) {
    ScalerContext.canvas = canvas;
  }
  static setContext(context) {
    ScalerContext.context = context;
  }
  static isUnicodePropertyEscapeSupported() {
    try {
      const regex = new RegExp("\\p{L}", "u");
      return true;
    } catch (e) {
      return false;
    }
  }
  static isEmoji(text) {
    let emojiRegExp;
    if (this.isUnicodePropertyEscapeSupported()) {
      emojiRegExp = new RegExp("\\p{Extended_Pictographic}|[#*0-9]\\uFE0F?\\u20E3|[\\uD83C\\uDDE6-\\uD83C\\uDDFF]", "u");
    } else {
      emojiRegExp = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
    }
    return emojiRegExp.test(text);
  }
  fontString(fauxBold, fauxItalic) {
    const attributes = [];
    if (fauxItalic) {
      attributes.push("italic");
    }
    if (fauxBold) {
      attributes.push("bold");
    }
    attributes.push(`${this.size}px`);
    const fallbackFontNames = defaultFontNames.concat();
    fallbackFontNames.unshift(...getFontFamilies(this.fontName, this.fontStyle));
    attributes.push(`${fallbackFontNames.join(",")}`);
    return attributes.join(" ");
  }
  getFontMetrics() {
    if (this.fontMetrics) {
      return this.fontMetrics;
    }
    const { context } = ScalerContext;
    context.font = this.fontString(false, false);
    const metrics = this.measureText(context, "H");
    const capHeight = metrics.actualBoundingBoxAscent;
    const xMetrics = this.measureText(context, "x");
    const xHeight = xMetrics.actualBoundingBoxAscent;
    this.fontMetrics = {
      ascent: -metrics.fontBoundingBoxAscent,
      descent: metrics.fontBoundingBoxDescent,
      xHeight,
      capHeight
    };
    return this.fontMetrics;
  }
  getBounds(text, fauxBold, fauxItalic) {
    const { context } = ScalerContext;
    context.font = this.fontString(fauxBold, fauxItalic);
    const metrics = this.measureText(context, text);
    const bounds = {
      left: Math.floor(-metrics.actualBoundingBoxLeft),
      top: Math.floor(-metrics.actualBoundingBoxAscent),
      right: Math.ceil(metrics.actualBoundingBoxRight),
      bottom: Math.ceil(metrics.actualBoundingBoxDescent)
    };
    if (bounds.left >= bounds.right || bounds.top >= bounds.bottom) {
      bounds.left = 0;
      bounds.top = 0;
      bounds.right = 0;
      bounds.bottom = 0;
    }
    return bounds;
  }
  getAdvance(text) {
    const { context } = ScalerContext;
    context.font = this.fontString(false, false);
    return context.measureText(text).width;
  }
  generateImage(text, fauxItalic, bounds) {
    const canvas = getCanvas2D(bounds.right - bounds.left, bounds.bottom - bounds.top);
    const context = canvas.getContext("2d");
    context.font = this.fontString(false, fauxItalic);
    context.fillText(text, -bounds.left, -bounds.top);
    return canvas;
  }
  loadCanvas() {
    if (!ScalerContext.canvas) {
      ScalerContext.setCanvas(getCanvas2D(10, 10));
      ScalerContext.setContext(
        ScalerContext.canvas.getContext("2d", { willReadFrequently: true })
      );
    }
  }
  measureText(ctx, text) {
    const metrics = ctx.measureText(text);
    if (metrics && (metrics.actualBoundingBoxAscent > 0 || metrics.width === 0)) {
      return metrics;
    }
    ctx.canvas.width = this.size * 1.5;
    ctx.canvas.height = this.size * 1.5;
    const pos = [0, this.size];
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillText(text, pos[0], pos[1]);
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const { left, top, right, bottom } = measureText(imageData);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let fontMeasure;
    const fontBoundingBox = this.fontBoundingBoxMap.find((item) => item.key === this.fontName);
    if (fontBoundingBox) {
      fontMeasure = fontBoundingBox.value;
    } else {
      ctx.fillText("\u6D4B", pos[0], pos[1]);
      const fontImageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      fontMeasure = measureText(fontImageData);
      this.fontBoundingBoxMap.push({ key: this.fontName, value: fontMeasure });
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    return {
      actualBoundingBoxAscent: pos[1] - top,
      actualBoundingBoxRight: right - pos[0],
      actualBoundingBoxDescent: bottom - pos[1],
      actualBoundingBoxLeft: pos[0] - left,
      fontBoundingBoxAscent: fontMeasure.bottom - fontMeasure.top,
      fontBoundingBoxDescent: 0,
      width: fontMeasure.right - fontMeasure.left
    };
  }
}


export { ScalerContext }
