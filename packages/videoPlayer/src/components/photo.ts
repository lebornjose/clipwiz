import { Editor } from '../index'
import { IPhotoTrackItem, MATERIAL_TYPE, IPhotoNode } from '@clipwiz/shared'
import { TIME_CONFIG } from '@clipwiz/shared'


export const addPhotoNode = (editor: Editor, trackId: string, item: IPhotoTrackItem) => {
  console.log(editor, trackId, item)
  let photoNode: IPhotoNode
  if (item.format === MATERIAL_TYPE.GIF) {
    const canvas = document.createElement('canvas')
    canvas.width = item.width
    canvas.height = item.height
    canvas.style.width = item.width + 'px'
    canvas.style.height = item.height + 'px'
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    photoNode = editor.videoCtx.canvas(canvas);
    photoNode.ctx = ctx;
    photoNode.url = item.url!
  } else {
    photoNode = editor.videoCtx.image(item.url!)
  }
  photoNode.id = item.id
  photoNode.trackId = trackId
  photoNode.materialId = item.materialId || item.id
  ;(photoNode as any).metaData = item
  photoNode.type = MATERIAL_TYPE.PHOTO
  photoNode.format = item.format as MATERIAL_TYPE.IMAGE | MATERIAL_TYPE.GIF
  photoNode.start(item.startTime / TIME_CONFIG.MILL_TIME_CONVERSION)
  photoNode.stop(item.endTime / TIME_CONFIG.MILL_TIME_CONVERSION)

  if (item.transform && typeof (photoNode as any).setTransform === 'function') {
    const halfW = (item.width ?? editor.canvasWidth) / 2
    const halfH = (item.height ?? editor.canvasHeight) / 2
    ;(photoNode as any).setTransform({
      scale: item.transform.scale?.[0] ?? 1,
      x: (item.transform.translate?.[0] ?? 0) / halfW,
      y: (item.transform.translate?.[1] ?? 0) / halfH,
    })
  }

  photoNode.connect(editor.videoCtx.destination)
  photoNode.registerCallback('loaded', () => {
    editor.draw();
  })
}
