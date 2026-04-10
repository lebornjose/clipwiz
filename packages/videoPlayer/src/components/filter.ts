import type { Editor } from '../index'
import { IFilterTrackItem, TIME_CONFIG } from '@clipwiz/shared'
import VideoContext from '../videocontext';

export interface FilterEffect {
  effectNode: any
  startTime: number  // 秒
  endTime: number    // 秒
  active: boolean
  routedNodes: Map<any, number>  // node -> 原始 zIndex
}

/**
 * 注册滤镜到 Editor，由 Editor.manageFilters() 统一在每帧调度
 */
export const addFilter = (editor: Editor, _trackId: string, item: IFilterTrackItem): void => {
  const effectNode = editor.videoCtx.effect(VideoContext.DEFINITIONS.MONOCHROME)
  // 不在此处 connect destination，由 manageFilters 在激活时以正确 zIndex 接入

  editor.filterEffects.push({
    effectNode,
    startTime: item.startTime / TIME_CONFIG.MILL_TIME_CONVERSION,
    endTime: item.endTime / TIME_CONFIG.MILL_TIME_CONVERSION,
    active: false,
    routedNodes: new Map(),
  })
}
