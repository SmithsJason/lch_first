import axios from 'axios'

// DeepSeek API 基础URL
const API_BASE_URL = 'https://api.deepseek.com'

// API密钥
let apiKey = ''

/**
 * 初始化DeepSeek API
 * @param {String} key API密钥
 */
export function initDeepSeekApi(key) {
  apiKey = key
}

/**
 * 获取聊天回复
 * @param {String} message 用户消息
 * @param {Array} history 聊天历史
 * @returns {Promise} API响应
 */
export async function getChatResponse(message, history = []) {
  if (!apiKey) {
    console.warn('DeepSeek API key not set')
    return mockChatResponse(message)
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/chat/completions`, {
      model: 'deepseek-chat',
      messages: [
        ...history.map(msg => ({
          role: msg.senderId === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 800
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    return response.data.choices[0].message.content
  } catch (error) {
    console.error('DeepSeek API error:', error)
    return mockChatResponse(message)
  }
}

/**
 * 获取热门话题建议
 * @returns {Promise} 热门话题列表
 */
export async function getTrendingSuggestions() {
  if (!apiKey) {
    console.warn('DeepSeek API key not set')
    return mockTrendingSuggestions()
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/completions`, {
      model: 'deepseek-chat',
      prompt: '请给我5个当前互联网上流行的热门话题或梗，简短表述，每个不超过15个字，不要编号，用|分隔',
      temperature: 0.7,
      max_tokens: 200
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    const content = response.data.choices[0].text
    return content.split('|').map(item => item.trim()).filter(item => item)
  } catch (error) {
    console.error('DeepSeek API error:', error)
    return mockTrendingSuggestions()
  }
}

/**
 * 模拟聊天回复（当API不可用时）
 * @param {String} message 用户消息
 * @returns {String} 模拟回复
 */
function mockChatResponse(message) {
  const responses = [
    '这个问题很有趣，让我思考一下...',
    '根据最新的互联网热点，这个话题很受欢迎呢！',
    '这让我想起了最近很火的一个梗："不要温柔地走进那个良夜"',
    '你知道吗？最近网上流行的"内卷"一词源自人类学术语"involution"',
    '这个问题很有意思，让我想到了"摸鱼"文化，你了解吗？',
    '最近"元宇宙"概念很火，这是未来互联网发展的重要方向',
    '听说过"AIGC"吗？这是AI生成内容的缩写，现在非常热门'
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * 模拟热门话题建议（当API不可用时）
 * @returns {Array} 模拟热门话题列表
 */
function mockTrendingSuggestions() {
  return [
    '元宇宙概念股',
    '双减政策影响',
    '躺平文化',
    '内卷现象',
    '虚拟偶像',
    'AIGC创作',
    '数字藏品',
    '智能家居',
    '碳中和'
  ]
}

export default {
  initDeepSeekApi,
  getChatResponse,
  getTrendingSuggestions
}