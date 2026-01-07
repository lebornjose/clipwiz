import { IMaterials } from "@van-gogh/video/render/packages/render"
import { get } from 'lodash-es'

export const readFile = (file: File): Promise<String | ArrayBuffer> =>
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


// 创建离屏 canvas
export function createOfflineCanvas(width: number, height: number) {
  let canvas: any = document.createElement('canvas')

  try {
    // @ts-ignore
    const offscreenCanvas = new OffscreenCanvas(0, 0)
    const context: any = offscreenCanvas.getContext('2d') as unknown as CanvasRenderingContext2D
    if (context?.measureText) {
      canvas = offscreenCanvas
    }
  } catch (err) { }

  if (typeof width == 'number') {
    canvas.width = width
  }
  if (typeof height == 'number') {
    canvas.height = height
  }

  return canvas
}


export function getMaterialId(material: IMaterials) {
  return get(material, 'node.id', null)
}