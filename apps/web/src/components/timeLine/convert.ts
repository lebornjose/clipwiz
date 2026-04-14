import { ITrack, ITrackInfo, MATERIAL_TYPE, TrackItem, IVideoTrackItem, resolveTransitionBetweenItems, ResolvedTransition } from '@clipwiz/shared'
import { TIME_CONFIG } from '@clipwiz/shared';
import { CustomTimelineRow } from './mock';

export type TimelineVideoActionData = IVideoTrackItem & {
  _transitionMeta?: ResolvedTransition | null
  _transitionSide?: 'left' | 'right' | null
}

// 把 trackInfo 转换为 TimelineRow
export const convertTrackInfoToTimelineRow = (trackInfo: ITrackInfo): CustomTimelineRow[] => {
  return trackInfo.tracks.map((item: ITrack) => {
    const children = item.children as TrackItem[]
    const videoChildren = item.trackType === MATERIAL_TYPE.VIDEO ? children as IVideoTrackItem[] : []

    return {
      id: item.trackId,
      actions: children.map((child: TrackItem, index: number) => {
        const prevVideoItem = item.trackType === MATERIAL_TYPE.VIDEO ? videoChildren[index - 1] : undefined
        const currentVideoItem = item.trackType === MATERIAL_TYPE.VIDEO ? (child as IVideoTrackItem) : undefined
        const nextVideoItem = item.trackType === MATERIAL_TYPE.VIDEO ? videoChildren[index + 1] : undefined

        // Resolve transitions from both sides
        const incomingResolved = prevVideoItem && currentVideoItem
          ? resolveTransitionBetweenItems(prevVideoItem, currentVideoItem)
          : null
        const outgoingResolved = currentVideoItem && nextVideoItem
          ? resolveTransitionBetweenItems(currentVideoItem, nextVideoItem)
          : null

        // Ownership rule: a resolved transition belongs to the clip whose field was matched.
        //   source starts with 'prev.'    → prev clip owns it → show on prev clip's RIGHT side
        //   source starts with 'current.' → current clip owns it → show on current clip's LEFT side
        // This prevents two adjacent clips both rendering a badge for the same transition.
        const showIncoming = incomingResolved?.source.startsWith('current.') ?? false
        const showOutgoing = outgoingResolved?.source.startsWith('prev.') ?? false

        const transitionMeta = showIncoming ? incomingResolved : showOutgoing ? outgoingResolved : null
        const transitionSide = showIncoming ? 'left' : showOutgoing ? 'right' : null

        return {
          id: child.id,
          effectId: item.trackType,
          start: child.startTime / TIME_CONFIG.MILL_TIME_CONVERSION,
          end: child.endTime / TIME_CONFIG.MILL_TIME_CONVERSION,
          selected: true,
          movable: true,
          data: {
            ...(child as any),
            _transitionMeta: transitionMeta,
            _transitionSide: transitionSide,
          } satisfies TimelineVideoActionData,
        }
      }),
      rowHeight: item.trackType === MATERIAL_TYPE.VIDEO ? 100 : 32,
    }
  })
};
