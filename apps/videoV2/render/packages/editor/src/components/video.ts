import type { IPhotoNode, IVideoNode, IVideoTrackItem } from '@van-gogh/video-render-constants'
import { LAYER_RENDERER_TYPE, MATERIAL_TYPE, STATE, TRANSITION_TYPE, timeConfig } from '@van-gogh/video-render-constants'
import commandFunc from '../../../common/index'
import type { Editor } from '../index'
import convertEndTime from '../utils/convertEndTime'
import { get } from 'lodash-es'

const toDraw = (editor: Editor) => {
  editor.subscribeUtil.publish('video_seek_success')
  editor.subscribeUtil.publish('video_loaded')
  editor.queueDraw()
}

let videoWaiting = 0 // 上报视频因为加载导致的loading 时间
let videoSeekTime = 0 //  上报视频seek到可播放的时间

const getImageBitmap = (url: string, width: number, height:number) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'Anonymous'; // 处理跨域问题
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0);
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height) as ImageData);
    };
    image.onerror = reject;
    image.src = url;
  });
}

export const updateTransitionImage = async (videoNode: IVideoNode | IPhotoNode, metaData: IVideoTrackItem, editor?:Editor) => {
  let transitionData = null
  if(videoNode.format === 'image') {
    transitionData = {
      in: await getImageBitmap(metaData.url,  metaData.width, metaData.height) as ImageData,
      out: await getImageBitmap(metaData.url,  metaData.width, metaData.height) as ImageData,
    }
  } else {
    try{
      transitionData = {
        in: await getImageBitmap(`${metaData.url}?x-oss-process=video/snapshot,t_${metaData.fromTime},w_${metaData.width}`, metaData.width, metaData.height) as ImageData,
        out: await getImageBitmap(`${metaData.url}?x-oss-process=video/snapshot,t_${metaData.toTime},w_${metaData.width}`, metaData.width, metaData.height)  as ImageData
      }
    } catch(e) {
      console.log(e)
    }
  }
  videoNode.transitionData = transitionData!
  editor && editor.queueDraw()
}

export const addVideoNode = (editor: Editor, trackId: string, item: IVideoTrackItem) => {
  let videoNode: IVideoNode | IPhotoNode
  if (item.startTime >= editor.totalTime) {
    return
  }
  if ([MATERIAL_TYPE.VIDEO, MATERIAL_TYPE.DIGITAL_VIDEO].includes(item.format)) {
    // TODO 这个加1 是伟大的TL们讨论出的成本最低方案，
    // 这个bug 的起因是因为算法取出了完成的 pts_time 时间，某一帧的完整时间，因为后端因为在转化存储的流程中把小数都给丢了
    // 我也弄不明白为什么把丢的小数加上来成本就高了，高在哪里
    // 所有tl们集中讨论出的成本最小方案
    videoNode = editor.videoCtx.video(item.url, (item.fromTime + 1) / 1000, 4, {
      volume: item.hide ? 0 : (item.volume || 0),
      loop: !!item?.useType,
    })
    // TODO 如果为视频且为保留原生，则该视频volume 为0, 视频
    videoNode.playbackRate = Math.min(item.playRate, 4)
    videoNode.sound = item.volume || 0
    videoNode.soundtrack = item.soundtrack || 0
    const starTime = (item.startTime) / timeConfig.MILL_TIME_CONVERSION
    videoNode.start(starTime)
    // const stopTime:number = item.startTime + (item.duration / item.playRate)
    // 计算出视频可以播放出的总长度
    let videoTotal = (item.toTime - item.fromTime)
    if (item.segmentEndTime) {
      videoTotal = (item.segmentEndTime - item.fromTime)
    }
    const endTime: number = Math.min(Math.ceil(videoTotal / item.playRate + item.startTime), item.endTime)
    const stopTime = convertEndTime(endTime, editor.totalTime)
    videoNode.stop(stopTime / timeConfig.MILL_TIME_CONVERSION)
    videoNode.total = (endTime - item.startTime) / timeConfig.MILL_TIME_CONVERSION
    videoNode.muted = item.muted ?? true
  } else {
    videoNode = editor.videoCtx.image(item.url)
    videoNode.start(item.startTime / timeConfig.MILL_TIME_CONVERSION)
    videoNode.stop(item.endTime / timeConfig.MILL_TIME_CONVERSION)
  }
  videoNode.commonEffects = item.commonEffects
  videoNode.metaData = item
  videoNode.id = item.id
  videoNode.format = item.format
  videoNode.type = MATERIAL_TYPE.VIDEO
  videoNode.useType = item.useType
  videoNode.trackId = trackId
  videoNode.pipParams = commandFunc.layerParams(item, LAYER_RENDERER_TYPE.IMAGE)
  videoNode.connect(editor.videoCtx.destination)
  updateTransitionImage(videoNode, item)
  const hideTransition = () => {
    editor.movie?.renderer?.hideTransition(videoNode.pipParams?.transitionOut)
  }
  const transitionFunc = () => {
    const duration = (videoNode?.pipParams?.transitionOut?.duration || 0) / timeConfig.MILL_TIME_CONVERSION
    let endTime = item.startTime / timeConfig.MILL_TIME_CONVERSION + duration / 2
    editor.videoCtx?.registerTimelineCallback(endTime, hideTransition, 0)
    // 新建转场
    // const transitionIn = get(videoNode, 'pipParams.transitionIn')
    // const transitionOut = get(videoNode, 'pipParams.transitionOut')
    // transitionIn && editor.movie?.renderer.getOrCreateTransition(videoNode, transitionIn, transitionOut!)
  }
  if (item.transitionOut) {
    transitionFunc()
  }
  videoNode.addTransition = transitionFunc
  videoNode.removeTransition = () => {
    editor.videoCtx.unregisterTimelineCallback(hideTransition)
  }
  videoNode.registerCallback('seek', () => {
    requestAnimationFrame(() => {
      const duration = (videoNode?.pipParams?.transitionOut?.duration || 0) / timeConfig.MILL_TIME_CONVERSION
      if (
        editor.currentTime >= (videoNode.startTime + duration / 2)
        && (editor.currentTime <= videoNode.stopTime)
      ) {
        if (videoNode.pipParams.transitionOut) {
          hideTransition()
        }
        if (videoNode.format === MATERIAL_TYPE.IMAGE) {
          toDraw(editor)
          return
        }
        videoSeekTime = performance.now()
      } else {
        editor.movie?.renderer?.hideOutOfRangeImageLayers(editor.currentTime)
      }
    })
  })
  videoNode.registerCallback('waiting', () => {
    if (editor.videoCtx.state !== STATE.PLAYING) {
      return
    }
    videoWaiting = performance.now()
    editor.isWaiting = true
    editor.videoCtx.pause()
    editor.setState({ loading: true })
  })
  videoNode.registerCallback('ended', () => {
    if (editor.currentTime <= editor.videoCtx.duration) {
      // 视频ended事件删除后，下一帧还没有马上渲染出来，放在下一帧隐藏
      // TODO 如果有相交转场的话，则不能添加requestAnimationFrame， 因为在下一帧删除画面，因为有转场效果，导致这张画面会被展示出来，出现闪烁的问题
      // if (videoNode?.pipParams?.transitionIn?.format === TRANSITION_TYPE.SUPERPOSE) {
      //   editor.movie?.renderer?.displayLayer(videoNode.id, false)
      // } else {
      requestAnimationFrame(() => {
        editor.movie?.renderer?.displayLayer(videoNode.id, false)
      })
      // }
    }
  })
  videoNode.registerCallback('loaded', () => {
    if (editor.currentTime >= videoNode.startTime && editor.currentTime <= videoNode.stopTime) {
      if (editor.isWaiting) {
        editor.isWaiting = false
        editor.setState({ loading: false })
        editor.play()
      } else {
      }
      // 这里需要判断一下，数字人需要后面夹在，不然会被正常图层覆盖
      // 老是要处理这种傻逼问题，真烦
      // if (videoNode.metaData?.webExtend?.isDigitalHuman && editor.videoCtx.duration) {
      //   setTimeout(() => {
      //     toDraw(editor)
      //   }, 200)
      // } else {
        toDraw(editor)
      // }
    }
  })
  // 新建layer
  editor.movie?.renderer?.getOrCreateTrackNode(videoNode)
}
