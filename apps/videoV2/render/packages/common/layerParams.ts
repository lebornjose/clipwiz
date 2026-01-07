import type { IPhotoTrackItem, ISubtitleTrackItem, ITextTrackItem, ITrackItem, IVideoTrackItem } from '../constants/src/index'

// 获取创建图层的默认对象
const imageParams = (item: IVideoTrackItem) => {
  return {
    type: 'image',
    transform: item.transform,
    transitionIn: item.transitionIn,
    transitionOut: item.transitionOut,
    crop: item.crop,
    palette: item.palette,
  }
}

const subtitleParams = (item: ISubtitleTrackItem) => {
  return {
    type: 'pag',
    materialId: item.materialId,
    transform: item.transform,
    text: item?.texts?.[0]?.text || '',
    position: item?.position,
    texts: item?.texts,
    fontFamily: item?.texts?.[0]?.fontFamily || '',
    fontStyle: item?.texts?.[0]?.fontSpec || '',
    color: item?.texts?.[0]?.color,
    fixedBoundbox: item?.fixedBoundbox,
    isSubtitle: item?.isSubtitle === 1,
    hide: item.hide,
    transition: item.transition,
  }
}

const textParams = (item: ITextTrackItem) => {
  return {
    type: 'pag',
    materialId: item.id,
    transform: item.transform,
    text: item?.texts[0].text || '',
    position: item?.position,
    texts: item?.texts,
    fontFamily: item?.texts?.[0]?.fontFamily || '',
    color: item?.texts?.[0].color,
    fixedBoundbox: item?.fixedBoundbox,
    isSubtitle: item?.isSubtitle === 1,
    hide: item.hide,
    transition: item.transition,
    width: item.width || 0,
    height: item.height || 0,
  }
}

const photoParams = (item: IPhotoTrackItem) => {
  return {
    materialId: item.materialId,
    transform: item.transform,
    type: 'photo',
    crop: item.crop,
  }
}

// type 0 imageLayer
// type 1 subtitleLayer
// type 2 photoLayer
const layerParams = (item: ITrackItem, type: number) => {
  const func: Array<Function> = [imageParams, subtitleParams, photoParams, textParams]
  const params = {
    blendMode: 1,
    boundBox: [0, 0, 0, 0],
    clip_layers: [],
    id: Number(item.id),
    width: item.width,
    height: item.height,
    fixedBoundbox: item?.fixedBoundbox,
    name: '底色',
    scaleMode: Number(item.scaleMode ?? 2), // 0:不缩放 1:拉伸 2:黑边 3:裁剪, 左上角为原点
    path: 'x', // TODO: @sualhuang wasm 实例化的时候需要这个字段，但是又没起作用
  }
  const other = func[type](item)
  return { ...params, ...other }
}

export default layerParams
