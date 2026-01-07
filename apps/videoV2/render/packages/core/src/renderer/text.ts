import { IFontParams, ITextLy} from "@van-gogh/video-render-constants"
import commandFunc from '../../../common/index'

// 用来处理pag 文本的展示方法

interface ITextUtil {
    pagRichText: (textLy: ITextLy, pipParams:IFontParams) => void
    pagText: (textLy: ITextLy, pipParams:IFontParams) => void
    hideRich: (materialId: string) => void
    removeText: () => void
}

let richText: any = {}

const setFont = (doc:any, item: IFontParams) => {
    if(!item) {
      return doc.text = ''
    }
    item.fontSize && (doc.fontSize = item.fontSize)
    item.text && (doc.text = item.text)
    item.color?.length && (doc.fillColor = commandFunc.arrToColor(item.color))
    item.fontFamily && (doc.fontFamily = commandFunc.getFontName(item?.fontFamily + item?.fontSpec))
    item.fontStyle && (doc.fontStyle = item.fontStyle)
    doc.tracking = item.tracking ?? 0
   
    if(item.leadingTimes) {
      doc._setLeadingTimes(item.leadingTimes ?? 2)
    } else {
      doc.leading = item.leading ?? 0
    }
    doc.fauxBold = item.fauxBold
    doc.fauxItalic = item.fauxItalic ?? false
    // 判断 item?.applyStroke 为true 或者 false 才能进入，如果为null 或者 underfined 则进入不了这个逻辑
    if(item.hasOwnProperty('applyStroke')) {
      doc.applyStroke = item.applyStroke
    }
    // doc.applyStroke = item.applyStroke
    // doc.applyStroke = !!(item.strokeColor && item.strokeColor?.length && item.strokeWidth)
    // TODO 真特么的坑，如果开始 applyStroke 那么  strokeWidth 设置为0还是有描边，需要设置为false
    // if(item.strokeWidth === 0) {
    //   doc.applyStroke = false
    // } else {
    //   doc.applyStroke = true
    // }
    item.strokeColor?.length && (doc.strokeColor = commandFunc.arrToColor(item.strokeColor))
    if(item.hasOwnProperty('strokeWidth')) {
      doc.strokeWidth = item.strokeWidth
    }
    item.backgroundColor?.length && (doc.backgroundColor = commandFunc.arrToColor(item.backgroundColor))
    doc.backgroundAlpha = item.backgroundAlpha
}

const textUtil: ITextUtil = {
    pagRichText: (textLy: ITextLy, pipParams:any) => {
        let obj = null
        const id = pipParams.id;
        const currentRichText = richText[`rich_${id}`]
        if(currentRichText && currentRichText.length === pipParams.texts.length) {
            obj = currentRichText.obj
        } else {
          currentRichText && (currentRichText.obj = null)
            obj = textLy._createRichTextBySize(pipParams.texts.length, pipParams.transition || '');
            richText[`rich_${id}`] = {obj, length: pipParams.texts.length}
        }
        obj._useOriginLayer(false)
        for(let i = 0; i < pipParams.texts.length; i++) {
            let item:IFontParams = pipParams.texts[i]
            let doc = obj._createDocumentByCopyAtIndex(i)
            setFont(doc, item);
            obj._replaceTextDocAtIndex(doc, i);
            if(item?.shadowColor) {
              obj._getOrCreateDropShadowToLayerAt(i)
              item.shadowColor && obj._setDropShadowColorAt(i, commandFunc.arrToColor(item.shadowColor))
              obj._setDropShadowDistanceAt(i, item.shadowDistance ?? 0)
              obj._setDropShadowAngleAt(i, item.shadowAngle ?? 0)
              obj._setDropShadowSizeAt(i, item.shadowSize ?? 0)
              obj._setDropShadowOpacityAt(i, item.shadowOpacity ?? 0)
            }
        }
    },

    pagText: (textLy: ITextLy, pipParams: any) => {
      if(pipParams?.shadowColor) {
        textLy._getOrCreateDropShadowToLayer()
        pipParams.shadowColor && textLy._setDropShadowColor(commandFunc.arrToColor(pipParams.shadowColor))
        textLy._setDropShadowDistance(pipParams.shadowDistance?? 0)  
        textLy._setDropShadowAngle(pipParams.shadowAngle ?? 0)
        textLy._setDropShadowSize(pipParams.shadowSize ?? 0)
        textLy._setDropShadowOpacity(pipParams.shadowOpacity ?? 0)
      }
      const doc: any = textLy._createDocumentByCopy()
      setFont(doc, pipParams)
      textLy._replaceTextInternal(doc)
    },
    hideRich: (materialId:string) => {
      let obj = richText[`rich_${materialId}`]?.obj
      if(obj) {
        obj._useOriginLayer(true)
      }
    },
    removeText: () => {
      richText = {}
    }
}


export default textUtil;
