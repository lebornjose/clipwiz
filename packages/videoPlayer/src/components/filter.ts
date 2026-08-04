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

/** 将滤镜稳定地路由到当前视频节点。effect 节点只允许一个输入。 */
export const syncFilterRoute = (
  editor: Editor,
  filter: FilterEffect,
  node: any,
): void => {
  const routedNode = filter.routedNodes.keys().next().value
  if (routedNode === node) return

  filter.effectNode.disconnect(editor.videoCtx.destination)
  filter.routedNodes.forEach((originalZIndex: number, routed: any) => {
    routed.disconnect(filter.effectNode)
    routed.connect(editor.videoCtx.destination, originalZIndex)
  })
  filter.routedNodes.clear()

  if (!node) return
  const conns: any[] = (editor.videoCtx as any)._renderGraph.getZIndexInputsForNode(editor.videoCtx.destination)
  const conn = conns.find((candidate: any) => candidate.source === node)
  const originalZIndex = conn ? conn.zIndex : 0
  node.disconnect()
  node.connect(filter.effectNode)
  filter.effectNode.connect(editor.videoCtx.destination, originalZIndex)
  filter.routedNodes.set(node, originalZIndex)
}
