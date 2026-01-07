

export { }

declare global {
  const __bl: {
    avg: (key: string, value: number) => void
    setPage: (key: string) => void
  }
}
