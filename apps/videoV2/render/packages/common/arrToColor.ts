// subtitle 返回的颜色值都是数组，需要将其转换为Color

const arrToColor = (arr: Array<number>) => {
  return {
    red: arr[0],
    green: arr[1],
    blue: arr[2],
  }
}

export default arrToColor
