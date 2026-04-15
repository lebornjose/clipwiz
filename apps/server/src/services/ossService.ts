import OSS from 'ali-oss'
import fs from 'fs'

let _client: OSS | null = null

function getClient(): OSS {
  if (!_client) {
    const region = (process.env.OSS_REGION || 'oss-cn-beijing').replace('.aliyuncs.com', '')
    _client = new OSS({
      region,
      accessKeyId: process.env.OSS_ACCESSKEYID || '',
      accessKeySecret: process.env.OSS_ACCESSKEYSECRET || '',
      bucket: process.env.BUCKET || '',
    })
  }
  return _client
}

/**
 * Upload a local file to OSS, returns the public URL.
 * @param localPath  Absolute path to the local temp file
 * @param ossKey     Target key in the bucket (e.g. "materials/uuid.mp4")
 */
export async function uploadToOSS(localPath: string, ossKey: string): Promise<string> {
  const c = getClient()
  const stream = fs.createReadStream(localPath)
  await c.putStream(ossKey, stream)
  const region = (process.env.OSS_REGION || 'oss-cn-beijing').replace('.aliyuncs.com', '')
  return `https://${process.env.BUCKET}.${region}.aliyuncs.com/${ossKey}`
}

export async function deleteFromOSS(ossKey: string): Promise<void> {
  await getClient().delete(ossKey)
}
