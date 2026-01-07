// 修复蓝牙信号导致一些短音频出现语音lou漏字和未播放的情况
import type { IVideoCtx } from '@van-gogh/video-render-constants'

// 设置占位mp3的默认数据
// 1 url 为无声音频，确保在蓝牙耳机的情况下，是一直有声音信号在传播
// 2. 设置一个基础音量，防止音频有声音，0.01 确保不可听见
// 3. rate 防止音频市场不够，所以慢放一下，确保可以覆盖住整个轨道
const defaultConfig = {
  url: 'https://mogic-creative.oss-cn-hangzhou.aliyuncs.com/original%2F20230223%2F1677141957254_%E7%A9%BA%E9%9F%B3%E4%B9%90%281%29.mp3',
  volume: 0.01, // 音量
  rate: 0.5, // 速率
}

// videoCtx 实例，可以添加音频node
// endTime 为整个协议的结束时间， 坑位占的时间为整个轨道时长
const bluetoothVolume = (videoCtx: IVideoCtx, endTime: number) => {
  const audioNode = videoCtx.audio(defaultConfig.url, 0, 4, { volume: defaultConfig.volume })
  audioNode.start(0)
  audioNode.stop(endTime)
  audioNode.muted = false
  audioNode.sound = defaultConfig.volume
  audioNode.playbackRate = defaultConfig.rate
  audioNode.volume = defaultConfig.volume
  audioNode.connect(videoCtx.destination)
}

export default bluetoothVolume
