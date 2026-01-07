/**
 * @description arms 上报 绘制一帧 wasm的耗时
 */

export const useWasmDrawTime = () => {
  // 绘制次数
  let drawCount = 0
  const wasmDrawCount = () => {
    drawCount++
  }
  // 绘制时间

  // 获取信息时间
  let getTotalTime = 0
  // 绘制一帧的时间
  let frameTotalTime = 0
  const getTotalStatistics = (time: number) => {
    getTotalTime += time
  }
  const frameTotalStatistics = (time: number) => {
    frameTotalTime += time
  }

  // 单次绘制wasm时间
  let time = 0
  let totalTime = 0
  const wasmDrawTime = () => {
    const startWasmDrawTime = () => {
      time = performance.now()
    }
    const endWasmDrawTime = () => {
      time = performance.now() - time
      totalTime += time
    }
    return {
      startWasmDrawTime,
      endWasmDrawTime,
    }
  }

  const clear = () => {
    totalTime = 0
    drawCount = 0
    getTotalTime = 0
    frameTotalTime = 0
  }

  const timer = setInterval(() => {
    if (drawCount) {
      //  上报
      if (typeof __bl !== 'undefined') {
        __bl.avg('video_draw_time', totalTime / drawCount)
        __bl.avg('video_get_data_time', getTotalTime / drawCount)
        __bl.avg('video_frame_time', frameTotalTime / drawCount)
      }
      clear()
    }
  }, 2000)

  const pause = () => {
    clearInterval(timer)
  }

  return {
    wasmDrawCount,
    wasmDrawTime,
    getTotalStatistics,
    frameTotalStatistics,
    stopArmsWasmDraw() {
      clear()
      pause()
    },
  }
}
