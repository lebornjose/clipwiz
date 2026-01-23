/* eslint-disable @typescript-eslint/no-unsafe-call */
import type { ISourceNode } from '@clipwiz/shared'
import { type INode, TIME_CONFIG } from '@clipwiz/shared'
import type { Editor } from '../index'

// TODO 如果贴图长宽特别大，会导致canvas 绘画 imageData 特别大，导致卡顿，转换一下高宽做一个缩放
const convertImageSize = (editor: Editor, width: number, height: number) => {
  let rate = height / editor.canvasHeight
  if (width > height) {
    rate = width / editor.canvasWidth
  }
  return { width: Math.round(width / rate), height: Math.round(height / rate) }
}

export const getBufferImage = (editor: Editor, node: INode, canvasEl: HTMLCanvasElement) => {
  if (!node.element) {
    return ''
  }
  try {
    let { width, height } = { width: 1280, height: 720 }
    if (editor.imageCatch[`imageCatch${node.id}`]) {
      return editor.imageCatch[`imageCatch${node.id}`]
    } else {
      if (!(node.element instanceof ImageBitmap)) {
        node.element.width = width
        node.element.height = height
      }
      if (width > editor.canvasWidth || height > editor.canvasHeight) {
        const obj = convertImageSize(editor, width, height)
        width = obj.width
        height = obj.height
      }
      canvasEl.width = width
      canvasEl.height = height
      const ctx = canvasEl.getContext('2d', { willReadFrequently: true })
      ctx?.drawImage(node.element as CanvasImageSource, 0, 0, width, height)
      const imageData = ctx?.getImageData(0, 0, width, height) as ImageData
      // 如果是图片，或者pag， 没有经常变化，可以存起来吧imageData, 不需要每次生成
      if (node.element instanceof ImageBitmap) {
        editor.imageCatch[`imageCatch${node.id}`] = imageData
      }
      return imageData
    }
  } catch (e) {

  }
}

export const getGifImage = (editor: Editor, node: ISourceNode, canvasEl: HTMLCanvasElement) => {
  if (!editor.gifSources[`gifSources${node.materialId}`]) {
    return
  }
  const { imageDecoder, frameCount, trackData } = editor.gifSources[`gifSources${node.materialId}`]
  const time: number = node._currentTime * TIME_CONFIG.MILL_TIME_CONVERSION
  // 按照每秒钟25帧处理，获取当前帧数
  let frameInx: number = Math.round(time / TIME_CONFIG.FRAME_TIME_MILL) % frameCount
  if (!frameInx) {
    frameInx = 1
  } // 因为gif第一帧都没有画面
  const track = trackData.get(frameInx)
  if (track) {
    // node.pipParams.width = track.codedWidth
    // node.pipParams.height = track.codedHeight
    return track.imageData
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return imageDecoder.decode({ frameIndex: frameInx }).then((frame: { image: CanvasImageSource & { codedWidth: number; codedHeight: number } }) => {
    const { codedWidth, codedHeight } = frame.image
    canvasEl.width = codedWidth
    canvasEl.height = codedHeight
    const ctx = canvasEl.getContext('2d')

    ctx?.drawImage(frame.image as CanvasImageSource, 0, 0, codedWidth, codedHeight)

    const imageData = ctx?.getImageData(0, 0, codedWidth, codedHeight)
    // node.pipParams.width = codedWidth
    // node.pipParams.height = codedHeight
    trackData.set(frameInx, { codedWidth, codedHeight, imageData })
    return imageData
  }) as Promise<ImageData | undefined>
}
