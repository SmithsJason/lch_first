import OSS from 'aliyun-oss-sdk'

// 阿里云 OSS 配置
const ossConfig = {
  region: 'your-region',
  accessKeyId: 'your-access-key-id',
  accessKeySecret: 'your-access-key-secret',
  bucket: 'your-bucket-name'
}

// 初始化 OSS 客户端
const ossClient = new OSS({
  region: ossConfig.region,
  accessKeyId: ossConfig.accessKeyId,
  accessKeySecret: ossConfig.accessKeySecret,
  bucket: ossConfig.bucket
})

// 上传文件到 OSS
export const uploadFile = async (file, directory = 'chat') => {
  try {
    const fileName = `${directory}/${Date.now()}-${file.name}`
    const result = await ossClient.put(fileName, file)
    return result.url
  } catch (error) {
    console.error('上传文件失败:', error)
    throw error
  }
}

// 获取文件 URL
export const getFileUrl = (fileName) => {
  return ossClient.signatureUrl(fileName, { expires: 3600 })
}

export default ossClient