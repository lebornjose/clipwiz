// 封装一下fetch 请求，添加一些默认的配置，直接返回请求结果


export const POST = async (url: string, body: any) => {
  const res = await fetch(url,  {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      })
  const data = await res.json()
  if (data.code !== 200) {
    throw new Error(data.message || '请求失败')
  } else {
    return data
  }
}
