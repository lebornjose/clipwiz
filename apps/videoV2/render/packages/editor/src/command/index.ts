import type { ACTION, IAllTrackItem, IAudioTrackItem, ISourceNode, IVideoTrackItem } from '@van-gogh/video-render-constants'
import { MATERIAL_ACTION, MATERIAL_TYPE } from '@van-gogh/video-render-constants'
import { addAudio } from '../components/audio'
import { addSound } from '../components/sound'
import { addText } from '../components/text'
import { addPag } from '../components/pag'
import { addVideoNode } from '../components/video'
import type { Editor } from '../index'
import { displayBgm, displayOral, updateAudioParams, updateBgmParams } from './components/audio'
import { addToPhoto, displayPhoto, updatePhotoParams } from './components/photo'
import { displaySubtitle, updateSubtitleParams } from './components/subtitle'
import { updateTextParams } from './components/text'
import { displayVideo, updateVideoParams } from './components/video'
import { updateSoundParams } from './components/sound'

export interface ICommandContext {
  trackId: string
  trackType: string
  content: IAllTrackItem
}

export interface ICommand {
  init: (type: ACTION, msg: ICommandContext) => void
  addNode: (msg: ICommandContext) => void
}

export class Command implements ICommand {
  public editor: Editor
  public addNodeFunc: {
    [key: string]: Function
  }

  public updateNodeFunc: {
    [key: string]: Function
  }

  public displayNodeFunc: {
    [key: string]: Function
  }

  constructor(editor: Editor) {
    this.editor = editor
    this.addNodeFunc = {
      [MATERIAL_TYPE.PHOTO]: addToPhoto,
      [MATERIAL_TYPE.TEXT]: addText,
      [MATERIAL_TYPE.SUBTITLE]: addPag,
      [MATERIAL_TYPE.VIDEO]: addVideoNode,
    }
    this.updateNodeFunc = {
      [MATERIAL_TYPE.VIDEO]: updateVideoParams,
      [MATERIAL_TYPE.PHOTO]: updatePhotoParams,
      [MATERIAL_TYPE.TEXT]: updateTextParams,
      [MATERIAL_TYPE.BGM_AUDIO]: updateBgmParams,
      [MATERIAL_TYPE.ORAL_AUDIO]: updateAudioParams,
      [MATERIAL_TYPE.SUBTITLE]: updateSubtitleParams,
      [MATERIAL_TYPE.SOUND_AUDIO]: updateSoundParams,
    }
    this.displayNodeFunc = {
      [MATERIAL_TYPE.VIDEO]: displayVideo,
      [MATERIAL_TYPE.PHOTO]: displayPhoto,
      [MATERIAL_TYPE.ORAL_AUDIO]: displayOral,
      [MATERIAL_TYPE.SOUND_AUDIO]: displayOral,
      [MATERIAL_TYPE.BGM_AUDIO]: displayOral,
      [MATERIAL_TYPE.TEXT]: displaySubtitle,
      [MATERIAL_TYPE.SUBTITLE]: displaySubtitle,
    }
  }

  disNode(context: IAllTrackItem) {
    const node = this.editor.videoCtx._sourceNodes.find((child: ISourceNode) => child.id === context.id)
    if (!node) {
      throw new Error('无法找到素材')
    }
    if (node) {
      if (node.format === MATERIAL_TYPE.GIF) {
        this.editor.gifSources[`gifSources${node.materialId}`]?.trackData?.clear?.()
      }
      node.destroy()
    }
    if ([MATERIAL_TYPE.SUBTITLE, MATERIAL_TYPE.TEXT].includes(node.type)) {
      this.editor?.movie?.renderer.removeLayer(node)
      this.editor?.movie?.renderer?.draw()
    } else {
      this.editor?.movie?.renderer.removeLayer(node)
      this.editor?.movie?.renderer?.draw()
    }
  }

  // type 命令操作
  // trackType 轨道类型
  // item 素材信息
  async init(type: ACTION, msg: ICommandContext) {
    switch (type) {
      case MATERIAL_ACTION.ADD:
        if (Array.isArray(msg)) {
          for (let i = 0; i < msg.length; i += 1) {
            const child = msg[i] as ICommandContext
            await this.addNode(child)
          }
          this.editor.queueDraw()
          break
        }
        await this.addNode(msg)
        this.editor.queueDraw()
        break
      case MATERIAL_ACTION.REMOVE:
        if (Array.isArray(msg)) {
          msg.forEach((child: ICommandContext) => {
            void this.disNode(child.content)
          })
          break
        }
        void this.disNode(msg.content)
        break
      case MATERIAL_ACTION.UPDATE:
        if (Array.isArray(msg)) {
          msg.forEach((child: ICommandContext) => {
            void this.updateNode(child)
          })
          break
        }
        void this.updateNode(msg)
        break
      case MATERIAL_ACTION.HIDE:
        void this.displayNode(msg, true)
        break
      default:
        void this.displayNode(msg, false)
    }
  }

  async addNode(msg: ICommandContext) {
    if (msg.trackType === MATERIAL_TYPE.BGM_AUDIO) {
      addAudio(this.editor, msg.trackId, msg.content as IAudioTrackItem)
      return
    }
    if (msg.trackType === MATERIAL_TYPE.SOUND_AUDIO) {
      addSound(this.editor, msg.trackId, msg.content as IAudioTrackItem)
      return
    }
    await this.addNodeFunc[msg.trackType](this.editor, msg.trackId, msg.content as IVideoTrackItem)
  }

  updateNode(msg: ICommandContext) {
    if (msg.content.hide !== undefined) {
      void this.displayNode(msg, msg.content.hide)
      return
    }
    this.updateNodeFunc[msg.trackType](this.editor, msg)
  }
  // 显示/隐藏轨道
  displayTrack(msg: ICommandContext, operate: boolean) {
      this.editor.movie?.renderer?.displayGroupLayer(msg.trackId, !operate)
      this.editor.movie?.renderer?.updateCmp2Content(msg.trackId, { hide: operate }, true)
  }

  displayNode(msg: ICommandContext, operate: boolean) {
    if (msg?.content?.id) {
      this.displayNodeFunc[msg.trackType](this.editor, msg, operate)
    } else if (msg?.trackId) {
      const arr = this.editor.videoCtx._sourceNodes.filter((child: ISourceNode) => child.trackId === msg.trackId)
      if (!arr.length) {
        throw new Error('无法找到轨道')
      }
      this.displayTrack(msg, operate)
      // 遍历轨道上的坑位，做隐藏
      for (let i = 0; i < arr.length; i += 1) {
        const contentMsg = { ...msg, ...{ content: { id: arr[i].id } } } as ICommandContext
        this.displayNodeFunc[msg.trackType](this.editor, contentMsg, operate)
      }
    }
    this.editor.draw()
  }
}
