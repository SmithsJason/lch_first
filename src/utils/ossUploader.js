import OSS from 'ali-oss'

// OSS客户端实例
let ossClient = null

/**
 * 初始化OSS客户端
 * @param {Object} config OSS配置
 */
export function initOssClient(config) {
  ossClient = new OSS({
    region: config.region,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    bucket: config.bucket,
  })
  return ossClient
}

/**
 * 上传文件到OSS
 * @param {File} file 要上传的文件
 * @param {String} directory 上传目录
 * @returns {Promise} 上传结果
 */
export async function uploadFile(file, directory = 'chat') {
  if (!ossClient) {
    throw new Error('OSS client not initialized')
  }
  
  try {
    const fileName = `${directory}/${Date.now()}-${file.name}`
    const result = await ossClient.put(fileName, file)
    return {
      url: result.url,
      name: file.name,
      size: file.size,
      type: file.type
    }
  } catch (error) {
    console.error('OSS upload error:', error)
    throw error
  }
}

/**
 * 获取文件的签名URL
 * @param {String} objectName 对象名称
 * @param {Number} expires 过期时间（秒）
 * @returns {String} 签名URL
 */
export function getSignedUrl(objectName, expires = 3600) {
  if (!ossClient) {
    throw new Error('OSS client not initialized')
  }
  
  try {
    return ossClient.signatureUrl(objectName, { expires })
  } catch (error) {
    console.error('Get signed URL error:', error)
    throw error
  }
}

export default {
  initOssClient,
  uploadFile,
  getSignedUrl
}