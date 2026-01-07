import { events } from '@van-gogh/video-editor'
import { TrackInfo } from '@van-gogh/video/shared'

export const PLAYER_CURRENT_TIME_CHANGE = 'customPlugin:player:currentTime@change'
export const PLAYER_STATE = 'customPlugin:player@state'
export const PLAYER_READY = 'customPlugin:player@ready'
export const PLAYER_SEEK = 'customPlugin:player:seek'
export const GET_TRACK_INFO_FROM_WASM_SDK = 'customPlugin:getTrackInfoFromWasmSdk'
export interface IPlayerState {
  loading?: boolean
  playing?: boolean
  muted?: boolean
  currentTime?: number
}

export const usePlayerPluginEvent = () => {
  const emitPlayerCurrentTimeChange = (time: number) => {
    events.emit(PLAYER_CURRENT_TIME_CHANGE, time)
  }

  const onPlayerCurrentTimeChange = (callback: (time: number) => void) => {
    events.on(PLAYER_CURRENT_TIME_CHANGE, callback)
  }

  const emitPlayerStateChange = (state: IPlayerState) => {
    events.emit(PLAYER_STATE, state)
  }

  const onPlayerStateChange = (callback: (state: IPlayerState) => void) => {
    events.on(PLAYER_STATE, callback)
  }

  const emitPlayerReady = () => {
    events.emit(PLAYER_READY)
  }

  const onPlayerReady = (callback: () => void) => {
    events.on(PLAYER_READY, callback)
  }

  const emitPlayerSeek = (time: number) => {
    events.emit(PLAYER_SEEK, time)
  }

  const onPlayerSeek = (callback: (time: number) => void) => {
    events.on(PLAYER_SEEK, callback)
  }

  const onGetTrackInfoFromWasmSdk = (callback: (fn: (trackInfo: TrackInfo) => void) => void) => {
    events.on(GET_TRACK_INFO_FROM_WASM_SDK, callback)
    return () => {
      events.off(GET_TRACK_INFO_FROM_WASM_SDK, callback)
    }
  }

  const emitGetTrackInfoFromWasmSdk = (fn: (trackInfo: TrackInfo) => void) => {
    events.emit(GET_TRACK_INFO_FROM_WASM_SDK, fn)
  }

  return {
    emitPlayerCurrentTimeChange,
    onPlayerCurrentTimeChange,
    emitPlayerStateChange,
    onPlayerStateChange,
    emitPlayerReady,
    onPlayerReady,
    emitPlayerSeek,
    onPlayerSeek,
    onGetTrackInfoFromWasmSdk,
    emitGetTrackInfoFromWasmSdk
  }
}
