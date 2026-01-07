<script setup lang="ts">
import { useTrackEvent, VideoController } from '@van-gogh/video-editor-plugins'
import { usePlayerDom, useVideoRenderer } from './hooks'
import type { IFontConfig } from './index'

export interface IPlayerPluginProps {
  [x: string]: any
  showController?: boolean
  preFontList?: IFontConfig[]
}

const props = withDefaults(defineProps<IPlayerPluginProps>(), {
  showController: true,
})

const { emitSelectedTrackItemClean } = useTrackEvent()

const handleClick = () => {
  emitSelectedTrackItemClean()
}

const playContainerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

const { canvasWidth, canvasHeight } = usePlayerDom(canvasRef, playContainerRef, { showController: props.showController })
const { loading, playing, muted, currentTime, duration } = useVideoRenderer(canvasRef, {
  preFontList: props.preFontList,
})

onMounted(() => {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // 页面不可见，暂停视频播放
      if (playing.value) {
        playing.value = false
      }
    }
  })
})
</script>

<template>
  <vg-spin :show="loading" h-full>
    <div ref="playContainerRef" w-full h-full flex="center col" @click="handleClick">
      <canvas
        ref="canvasRef"
        :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }"
        v-bind="$attrs"
      />
      <div v-if="showController" flex-center py-12px w-full>
        <VideoController
          v-model:playing="playing"
          v-model:muted="muted"
          :current-time="currentTime" :duration="duration"
          @click.stop
        />
      </div>
    </div>
  </vg-spin>
</template>
