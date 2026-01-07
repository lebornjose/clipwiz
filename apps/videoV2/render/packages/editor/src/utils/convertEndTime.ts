const convertEndTime = (time: number, total: number) => {
  if (time >= total) {
    return total
  }
  return time
}

export default convertEndTime
