import { io } from 'socket.io-client'

let socket = null
let messageCallbacks = []
let statusCallbacks = []

/**
 * 初始化WebSocket连接
 * @param {String} url WebSocket服务器URL
 * @param {Object} options 连接选项
 * @returns {Object} socket实例
 */
export function initSocket(url, options = {}) {
  if (socket) {
    socket.disconnect()
  }
  
  socket = io(url, options)
  
  socket.on('connect', () => {
    console.log('WebSocket connected')
    notifyStatusChange({ connected: true })
  })
  
  socket.on('disconnect', () => {
    console.log('WebSocket disconnected')
    notifyStatusChange({ connected: false })
  })
  
  socket.on('message', (message) => {
    notifyMessageReceived(message)
  })
  
  socket.on('error', (error) => {
    console.error('WebSocket error:', error)
    notifyStatusChange({ error })
  })
  
  return socket
}

/**
 * 发送消息
 * @param {String} event 事件名称
 * @param {Object} data 消息数据
 * @returns {Boolean} 是否发送成功
 */
export function sendMessage(event, data) {
  if (!socket || !socket.connected) {
    console.error('WebSocket not connected')
    return false
  }
  
  socket.emit(event, data)
  return true
}

/**
 * 添加消息接收回调
 * @param {Function} callback 回调函数
 */
export function onMessage(callback) {
  if (typeof callback === 'function') {
    messageCallbacks.push(callback)
  }
}

/**
 * 添加状态变化回调
 * @param {Function} callback 回调函数
 */
export function onStatusChange(callback) {
  if (typeof callback === 'function') {
    statusCallbacks.push(callback)
  }
}

/**
 * 移除消息接收回调
 * @param {Function} callback 回调函数
 */
export function offMessage(callback) {
  messageCallbacks = messageCallbacks.filter(cb => cb !== callback)
}

/**
 * 移除状态变化回调
 * @param {Function} callback 回调函数
 */
export function offStatusChange(callback) {
  statusCallbacks = statusCallbacks.filter(cb => cb !== callback)
}

/**
 * 通知所有消息接收回调
 * @param {Object} message 接收到的消息
 */
function notifyMessageReceived(message) {
  messageCallbacks.forEach(callback => {
    try {
      callback(message)
    } catch (error) {
      console.error('Error in message callback:', error)
    }
  })
}

/**
 * 通知所有状态变化回调
 * @param {Object} status 连接状态
 */
function notifyStatusChange(status) {
  statusCallbacks.forEach(callback => {
    try {
      callback(status)
    } catch (error) {
      console.error('Error in status callback:', error)
    }
  })
}

/**
 * 断开WebSocket连接
 */
export function disconnect() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export default {
  initSocket,
  sendMessage,
  onMessage,
  onStatusChange,
  offMessage,
  offStatusChange,
  disconnect
}