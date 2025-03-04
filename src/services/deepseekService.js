import api from './api'

// 调用 DeepSeek API 获取智能回复
export const getAiResponse = async (message, context = []) => {
  try {
    const response = await api.post('/ai/chat', {
      message,
      context
    })
    return response.data.response
  } catch (error) {
    console.error('获取AI回复失败:', error)
    return '抱歉，我暂时无法回应，请稍后再试。'
  }
}

// 获取热门话题或梗
export const getTrendingTopics = async () => {
  try {
    const response = await api.get('/ai/trending-topics')
    return response.data.topics
  } catch (error) {
    console.error('获取热门话题失败:', error)
    return []
  }
}

// 获取智能建议
export const getSuggestions = async (context) => {
  try {
    const response = await api.post('/ai/suggestions', {
      context
    })
    return response.data.suggestions
  } catch (error) {
    console.error('获取智能建议失败:', error)
    return []
  }
}

export default {
  getAiResponse,
  getTrendingTopics,
  getSuggestions
}