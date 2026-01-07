import type { VideoEditorPluginCreator } from '@van-gogh/video-editor'
import { AREA_TYPE } from '@van-gogh/video-editor-shared'
import type { IPlayerPluginProps } from './index.vue'
import Player from './index.vue'

export interface IFontConfig {
  fontFamily: string
  fontSpec?: string
}

export const createPlayerPlugin = (opts?: IPlayerPluginProps) => {
  const PlayerPlugin: VideoEditorPluginCreator = (ctx) => {
    return {
      name: 'player',
      async init() {
        const { skeleton } = ctx
        skeleton.add(
          {
            areaType: AREA_TYPE.centerArea,
          },
          {
            type: 'Panel',
            name: 'playerPanel',
            content: <Player {...opts} />,
          })
        return Promise.resolve()
      },
    }
  }
  return PlayerPlugin
}

export * from './event'
