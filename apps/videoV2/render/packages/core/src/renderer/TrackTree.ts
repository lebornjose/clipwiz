import { PAG } from "@van-gogh/video-render-paglib-v2/src/types";
import { INode } from "@van-gogh/video/render/packages/render";
import { ISourceNode } from "@van-gogh/videoV2/render/packages/constants";
// import { PhotoTrackItem, SubtitleTrackItem, TextTrackItem, Track, VideoTrackItem } from "@van-gogh/video/shared";

// 图层类型
export enum LAYER_TYPE {
    image = 'image', // 坑位：图片
    pag = 'pag', // 坑位：pag
    group = 'group', // 轨道
    root = 'root'
}

// 特效类型
export enum EFFECT_TYPE {
    common = 3,
    crop = 2,
    palette = 1,
    unknow = 0
}

export interface ITrackNode {
    layerType: LAYER_TYPE,
    parentId: string,
    id: string,
    layer: PAG,
    commonEffectMap?: Map<string, any>, // 位移
    cropEffectMap?: Map<string, any>, // 裁剪
    paletteEffectMap?: Map<string, any>, // 调色
    transitionMap?: Map<string, any> // 转场，只在group中有
    trackItem?: any,
    videoCtxNode?: ISourceNode
    children?: ITrackNode[],
}
/**
 * 1. 读取rootNode文件，并创建树结构
 * 2. 提供树结构的方法，不直接操作layer
 */
class TrackTree {
    tree?: ITrackNode;
    groupBucket: Map<string, ITrackNode>; // 存放轨道节点
    nodeBucket: Map<string, ITrackNode>; // 存放坑位节点
    constructor() {
        this.groupBucket = new Map()
        this.nodeBucket = new Map()
    }
    bindVideoCtxNode(id: string, videoCtxNode: ISourceNode) {
        const node = this.findNode(id)
        if (node) {
            node.videoCtxNode = videoCtxNode
        }
    }
    clear() {
        this.tree = {
            parentId: 'null',
            id: 'root',
            layer: 'null' as unknown as PAG,
            layerType: LAYER_TYPE.root,
            children: [],
        }
        this.nodeBucket.clear()
        this.groupBucket.clear()
    }
    createTree(rootNode: PAG) {
        this.clear()
        const len = rootNode._numberChildren()
        for (let i = 0; i < len; i++) {
            const child = rootNode._getBannerLayerAt(i)
            const trackNode = this.createNode(child, this.tree!.id)
            this.tree!.children!.push(trackNode)
        }
        console.log('tree', this)
    }
    // 获取layer的effect节点，包含cropEffect 和 commonEffect
    getEffectMap(layer: PAG) {
        const len = layer._numberEffect()
        const effectMap: Record<string, any> = {
            cropEffectMap: new Map(),
            commonEffectMap: new Map(),
            paletteEffectMap: new Map()
        }
        for (let i = 0; i < len; i++) {
            const effectNode = layer._getEffectAtIndex(i);
            const type = effectNode._type()?.value;
            if (type === EFFECT_TYPE.crop) {
                effectMap.cropEffectMap.set(i, effectNode);
            } else if (type === EFFECT_TYPE.common) {
                effectMap.commonEffectMap.set(i, effectNode);
            } else if (type === EFFECT_TYPE.palette) {
                effectMap.paletteEffectMap.set(i, effectNode);
            }
        }
        return effectMap;
    }
    // 获取轨道上的转场
    getTransitionMap(layer: PAG) {
        const layerType = this.getLayerType(layer);
        let transitionMap: Map<string, any> = new Map()
        if (layerType === LAYER_TYPE.group) {
            const len = layer._numberTransition()
            for (let i = 0; i < len; i++) {
                const transition = layer._getTransitionAt(i)
                const transitionId = transition._getTransitionID()
                transitionMap.set(transitionId, transition)
            }
        }
        return transitionMap
    }
    getLayerType(layer: PAG) {
        return layer._getLayerType() as LAYER_TYPE
    }
    // 创建节点
    createNode(layer: PAG, parentNodeId: string): ITrackNode {
        const len = layer._numberChildren?.();
        const effectMap = this.getEffectMap(layer);
        const transitionMap = this.getTransitionMap(layer);
        const json = JSON.parse(layer._getCmp2Content())
        const layerType = this.getLayerType(layer);

        const result: ITrackNode = {
            parentId: parentNodeId,
            id: json.id || json.trackId,
            layer,
            ...effectMap,
            transitionMap,
            layerType: layerType,
            trackItem: (layerType === LAYER_TYPE.image || layerType === LAYER_TYPE.pag) ? json : null,
        };

        if (layerType === LAYER_TYPE.group) {
            this.groupBucket.set(result.id, result)
        } else {
            this.nodeBucket.set(result.id, result)
        }

        if (typeof len === 'number' && len > 0) {
            for (let i = 0; i < len; i++) {
                const child = layer._getBannerLayerAt(i)
                const childNode = this.createNode(child, result.id)
                if (child) {
                    if (result.children) {
                        result.children.push(childNode)
                    } else {
                        result.children = [childNode]
                    }
                }
            }
        }
        return result;
    }
    // 获取坑位节点
    findNode(id: string): ITrackNode | undefined {
        return this.nodeBucket.get(id)
    }
    // 获取轨道节点
    findGroupNode(id: string) {
        return this.groupBucket.get(id)
    }
    // 获取effectTransition节点，必然在group节点上
    findEffectTransition(transitionId: string) {
        for (const node of this.groupBucket.values()) {
            if (node.transitionMap?.has(transitionId)) {
                return node.transitionMap.get(transitionId)
            }
        }
        return null
    }
    findGroupNodeByTransitionId(transitionId: string) {
        for (const node of this.groupBucket.values()) {
            if (node.transitionMap?.has(transitionId)) {
                return node
            }
        }
        return null
    }
    // 遍历树，排除group节点
    traverseTree(callback: (node: ITrackNode) => void) {
        const traverseNode = (node: ITrackNode) => {
            const { layerType } = node
            if (layerType === LAYER_TYPE.image || layerType === LAYER_TYPE.pag) {
                callback(node);
            }
            if (node.children) {
                for (const child of node.children) {
                    traverseNode(child);
                }
            }
        };
        traverseNode(this.tree!);
    }
}

export default TrackTree;