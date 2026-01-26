type EventCallback = (...args: any[]) => void

interface EventMap {
  [eventName: string]: EventCallback[]
}

/**
 * 事件总线类 - 用于组件间通信
 * 实现发布-订阅模式
 */
class EventBus {
  private events: EventMap = {}

  /**
   * 订阅事件
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  on(eventName: string, callback: EventCallback): void {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    this.events[eventName].push(callback)
  }

  /**
   * 取消订阅事件
   * @param eventName 事件名称
   * @param callback 回调函数，如果不传则移除该事件的所有监听器
   */
  off(eventName: string, callback?: EventCallback): void {
    if (!this.events[eventName]) {
      return
    }

    if (callback) {
      // 移除指定的回调函数
      this.events[eventName] = this.events[eventName].filter(
        (cb) => cb !== callback
      )
    } else {
      // 移除该事件的所有监听器
      delete this.events[eventName]
    }
  }

  /**
   * 触发事件
   * @param eventName 事件名称
   * @param args 传递给回调函数的参数
   */
  emit(eventName: string, ...args: any[]): void {
    if (!this.events[eventName]) {
      return
    }

    // 执行所有订阅该事件的回调函数
    this.events[eventName].forEach((callback) => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`Error in event handler for "${eventName}":`, error)
      }
    })
  }

  /**
   * 只订阅一次事件，触发后自动取消订阅
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  once(eventName: string, callback: EventCallback): void {
    const onceCallback: EventCallback = (...args: any[]) => {
      callback(...args)
      this.off(eventName, onceCallback)
    }
    this.on(eventName, onceCallback)
  }

  /**
   * 清空所有事件监听器
   */
  clear(): void {
    this.events = {}
  }

  /**
   * 获取某个事件的监听器数量
   * @param eventName 事件名称
   * @returns 监听器数量
   */
  listenerCount(eventName: string): number {
    return this.events[eventName]?.length || 0
  }

  /**
   * 获取所有事件名称
   * @returns 事件名称数组
   */
  eventNames(): string[] {
    return Object.keys(this.events)
  }
}

// 导出单例实例
export const eventBus = new EventBus()

// 也导出类，方便创建多个实例
export default EventBus
