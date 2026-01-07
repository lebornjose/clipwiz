import type { IEventSubscribe } from '@van-gogh/video-render-constants'
export class EventSubscribe implements IEventSubscribe {
  public events: any = {}

  subscribe(eventName: any, callback: Function) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!this.events[eventName]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.events[eventName] = []
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    this.events[eventName].push(callback)
  }

  once(eventName: string, callback: Function) {
    const wrapper = (data: any) => {
      callback(data)
      this.unsubscribe(eventName, wrapper)
    }
    this.subscribe(eventName, wrapper)
  }

  unsubscribe(eventName: string, callback: Function) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!this.events[eventName]) {
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const index = this.events[eventName].indexOf(callback)
    if (index !== -1) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      this.events[eventName].splice(index, 1)
    }
  }

  publish(eventName: any, data: any) {
    if (!this.events) {
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    this.events[eventName]?.forEach((callback: Function) => {
      callback(data)
    })
  }
}
