// 封装一下fetch 请求，添加一些默认的配置，直接返回请求结果

const handleResponse = async (res: Response) => {
  const data = await res.json()
  if (data.code !== 200) {
    throw new Error(data.message || '请求失败')
  }
  return data
}

export const GET = async (url: string) => {
  const res = await fetch(url)
  return handleResponse(res)
}

export const POST = async (url: string, body: any) => {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
  return handleResponse(res)
}

export const PUT = async (url: string, body: any) => {
  const res = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
  return handleResponse(res)
}

export const DELETE = async (url: string) => {
  const res = await fetch(url, { method: 'DELETE' })
  return handleResponse(res)
}
