import api from './api'
import { io } from 'socket.io-client'

// WebSocket 连接
let socket = null

// 初始化 WebSocket 连接
export const initWebSocket = (token, onMessageReceived) => {
  // 实际项目中替换为你的 WebSocket 服务器地址
  socket = io('http://localhost:3000', {
    auth: {
      token
    }
  })
  
  socket.on('connect', () => {
    console.log('WebSocket connected')
  })
  
  socket.on('message', (message) => {
    if (onMessageReceived) {
      onMessageReceived(message)
    }
  })
  
  socket.on('disconnect', () => {
    console.log('WebSocket disconnected')
  })
  
  return socket
}

// 发送消息
export const sendMessage = (message) => {
  if (socket) {
    socket.emit('message', message)
  }
}

// 获取聊天历史
export const getChatHistory = async (contactId) => {
  try {
    const response = await api.get(`/messages/${contactId}`)
    return response.data
  } catch (error) {
    console.error('获取聊天历史失败:', error)
    return []
  }
}

// 获取联系人列表
export const getContacts = async () => {
  try {
    const response = await api.get('/contacts')
    return response.data
  } catch (error) {
    console.error('获取联系人列表失败:', error)
    return []
  }
}

// 获取 AI 建议
export const getAiSuggestion = async (context) => {
  try {
    const response = await api.post('/ai/suggestion', { context })
    return response.data.suggestion
  } catch (error) {
    console.error('获取AI建议失败:', error)
    return null
  }
}