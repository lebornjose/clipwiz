import { TrackInfo } from "@van-gogh/video/shared";
// import { get } from "lodash-es";

// type Track = TrackInfo['tracks'][0]

/**
 * Merge track info from sdk and track info from user.
 * 在重构SDK的时候，图层相关的协议，统一由SDK吐出，后续SDK新加字段，前端不感知
 * @param sdkTrackInfo
 * @param trackInfo
 */
export function mergeTrackInfoBySdk(sdkTrackInfo: TrackInfo, trackInfo: TrackInfo) {
    // const sdkTracks = get(sdkTrackInfo, 'tracks', []).filter((track: Track) => track.children.length !== 0)
    // trackInfo.tracks = trackInfo.tracks.map((track: Track) => {
    //   const sdkTrack = sdkTracks.find((sdkTrack: Track) => sdkTrack.trackId === track.trackId)
    //   // TODO 零时添加
    //   if(track.trackType === 'video') {
    //     return track
    //   }
    //   if (!sdkTrack) {
    //       return track
    //   }

    //   return sdkTrack
    // })
    console.log('mergeTrackInfoBySdk', trackInfo)
    return trackInfo
}
