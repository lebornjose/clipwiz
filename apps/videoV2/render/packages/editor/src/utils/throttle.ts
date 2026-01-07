const throttle = function (func: Function, delay: number) {
  let timerId: NodeJS.Timer | null
  return function (...args: any[]) {
    if (!timerId) {
      timerId = setTimeout(() => {
        // @ts-ignore
        func.apply(this, args)
        timerId && clearTimeout(timerId)
        timerId = null
      }, delay)
    }
  }
}

export default throttle
