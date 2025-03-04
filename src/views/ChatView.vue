<template>
  <div class="chat-container">
    <div class="sidebar">
      <div class="user-info">
        <img :src="currentUser.avatar" alt="avatar" class="avatar" />
        <span class="username">{{ currentUser.username }}</span>
      </div>
      <div class="contact-list">
        <div 
          v-for="contact in contacts" 
          :key="contact.id" 
          class="contact-item"
          :class="{ active: selectedContact.id === contact.id }"
          @click="selectContact(contact)"
        >
          <img :src="contact.avatar" alt="avatar" class="contact-avatar" />
          <div class="contact-info">
            <div class="contact-name">{{ contact.name }}</div>
            <div class="contact-last-message">{{ contact.lastMessage }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="chat-main">
      <div class="chat-header">
        <div class="contact-name">{{ selectedContact.name }}</div>
      </div>
      
      <div class="chat-messages" ref="messagesContainer">
        <div 
          v-for="(message, index) in messages" 
          :key="index" 
          class="message"
          :class="{ 'message-self': message.senderId === currentUser.id }"
        >
          <img :src="message.avatar" alt="avatar" class="message-avatar" />
          <div class="message-content">
            <div class="message-text">{{ message.text }}</div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>
      
      <div class="chat-input">
        <div class="ai-suggestion" v-if="aiSuggestion">
          <div class="suggestion-content">
            <span>AI建议: {{ aiSuggestion }}</span>
            <el-button size="small" type="primary" @click="useAiSuggestion">使用</el-button>
          </div>
        </div>
        
        <el-input
          v-model="messageInput"
          type="textarea"
          :rows="3"
          placeholder="输入消息..."
          @keyup.enter.native="sendMessage"
        ></el-input>
        
        <div class="input-actions">
          <el-button type="primary" @click="sendMessage" :disabled="!messageInput.trim()">
            发送
          </el-button>
          <el-button @click="getAiSuggestion">获取AI建议</el-button>
          <el-upload
            class="upload-button"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
          >
            <el-button>上传文件</el-button>
          </el-upload>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed, watch } from 'vue'
import { io } from 'socket.io-client'
import axios from 'axios'
import OSS from 'ali-oss'

// 当前用户信息
const currentUser = ref(JSON.parse(localStorage.getItem('user') || '{}'))

// 联系人列表
const contacts = reactive([
  { 
    id: 1, 
    name: '张三', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=张三',
    lastMessage: '你好，最近怎么样？' 
  },
  { 
    id: 2, 
    name: '李四', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=李四',
    lastMessage: '周末有空吗？' 
  },
  { 
    id: 3, 
    name: 'AI助手', 
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AI',
    lastMessage: '有什么可以帮助你的？' 
  }
])

// 选中的联系人
const selectedContact = ref(contacts[0])

// 消息列表
const messages = ref([
  {
    id: 1,
    text: '你好，最近怎么样？',
    senderId: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=张三',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: 2,
    text: '我很好，谢谢关心！',
    senderId: currentUser.value.id,
    avatar: currentUser.value.avatar,
    timestamp: new Date(Date.now() - 3000000)
  }
])

// 消息输入
const messageInput = ref('')
const messagesContainer = ref(null)
const aiSuggestion = ref('')

// WebSocket 连接
let socket = null

// 阿里云OSS客户端
let ossClient = null

onMounted(() => {
  // 初始化 WebSocket 连接
  initWebSocket()
  
  // 初始化阿里云OSS客户端
  initOssClient()
  
  // 滚动到最新消息
  scrollToBottom()
})

watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

watch(() => selectedContact.value, () => {
  // 切换联系人时加载对应的聊天记录
  loadMessages()
})

const initWebSocket = () => {
  // 实际项目中替换为你的 WebSocket 服务器地址
  socket = io('http://localhost:3000', {
    auth: {
      token: 'your-auth-token'
    }
  })
  
  socket.on('connect', () => {
    console.log('WebSocket connected')
  })
  
  socket.on('message', (message) => {
    messages.value.push(message)
  })
  
  socket.on('disconnect', () => {
    console.log('WebSocket disconnected')
  })
}

const initOssClient = () => {
  // 实际项目中替换为你的阿里云OSS配置
  ossClient = new OSS({
    region: 'oss-cn-hangzhou',
    accessKeyId: 'your-access-key-id',
    accessKeySecret: 'your-access-key-secret',
    bucket: 'your-bucket-name',
  })
}

const loadMessages = () => {
  // 实际项目中从服务器加载消息历史
  // 这里使用模拟数据
  if (selectedContact.value.id === 1) {
    messages.value = [
      {
        id: 1,
        text: '你好，最近怎么样？',
        senderId: 1,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=张三',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 2,
        text: '我很好，谢谢关心！',
        senderId: currentUser.value.id,
        avatar: currentUser.value.avatar,
        timestamp: new Date(Date.now() - 3000000)
      }
    ]
  } else if (selectedContact.value.id === 2) {
    messages.value = [
      {
        id: 3,
        text: '周末有空吗？',
        senderId: 2,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=李四',
        timestamp: new Date(Date.now() - 7200000)
      }
    ]
  } else if (selectedContact.value.id === 3) {
    messages.value = [
      {
        id: 4,
        text: '有什么可以帮助你的？',
        senderId: 3,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AI',
        timestamp: new Date(Date.now() - 86400000)
      }
    ]
  }
}

const sendMessage = () => {
  if (!messageInput.value.trim()) return
  
  const newMessage = {
    id: Date.now(),
    text: messageInput.value,
    senderId: currentUser.value.id,
    avatar: currentUser.value.avatar,
    timestamp: new Date()
  }
  
  messages.value.push(newMessage)
  
  // 通过 WebSocket 发送消息
  if (socket) {
    socket.emit('message', {
      text: messageInput.value,
      recipientId: selectedContact.value.id
    })
  }
  
  // 更新最后一条消息
  const contactIndex = contacts.findIndex(c => c.id === selectedContact.value.id)
  if (contactIndex !== -1) {
    contacts[contactIndex].lastMessage = messageInput.value
  }
  
  messageInput.value = ''
  aiSuggestion.value = ''
  
  // 如果是AI助手，模拟回复
  if (selectedContact.value.id === 3) {
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: '我是AI助手，正在处理您的请求...',
        senderId: 3,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AI',
        timestamp: new Date()
      }
      messages.value.push(aiResponse)
      
      // 模拟调用DeepSeek API
      setTimeout(() => {
        getDeepSeekResponse(newMessage.text)
      }, 1500)
    }, 1000)
  }
}

const getDeepSeekResponse = async (userMessage) => {
  try {
    // 实际项目中替换为 DeepSeek API 调用
    // 这里使用模拟数据
    const responses = [
      '根据最新的互联网热点，这个话题很受欢迎呢！',
      '这让我想起了最近很火的一个梗："不要温柔地走进那个良夜"',
      '你知道吗？最近网上流行的"内卷"一词源自人类学术语"involution"',
      '这个问题很有意思，让我想到了"摸鱼"文化，你了解吗？'
    ]
    
    const aiResponse = {
      id: Date.now(),
      text: responses[Math.floor(Math.random() * responses.length)],
      senderId: 3,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AI',
      timestamp: new Date()
    }
    
    messages.value.push(aiResponse)
  } catch (error) {
    console.error('获取DeepSeek响应失败:', error)
  }
}

const getAiSuggestion = async () => {
  try {
    // 实际项目中替换为 DeepSeek API 调用
    // 这里使用模拟数据
    const suggestions = [
      '最近的热门话题是世界杯',
      '你知道最新的AI技术进展吗？',
      '今天天气真不错，适合出去走走',
      '最近有什么好看的电影推荐吗？',
      '听说过"双减"政策吗？这是最近的热门话题',
      '你玩过"原神"这款游戏吗？很多人都在讨论它',
      '最近"元宇宙"概念很火，你怎么看？'
    ]
    
    aiSuggestion.value = suggestions[Math.floor(Math.random() * suggestions.length)]
  } catch (error) {
    console.error('获取AI建议失败:', error)
  }
}

const useAiSuggestion = () => {
  if (aiSuggestion.value) {
    messageInput.value = aiSuggestion.value
    aiSuggestion.value = ''
  }
}

const handleFileChange = async (file) => {
  if (!file) return
  
  try {
    // 上传文件到阿里云OSS
    const result = await uploadToOss(file.raw)
    
    // 发送文件消息
    const fileMessage = {
      id: Date.now(),
      text: `[文件] ${file.name}`,
      fileUrl: result.url,
      fileName: file.name,
      fileType: file.raw.type,
      senderId: currentUser.value.id,
      avatar: currentUser.value.avatar,
      timestamp: new Date()
    }
    
    messages.value.push(fileMessage)
    
    // 通过 WebSocket 发送文件消息
    if (socket) {
      socket.emit('file', {
        fileUrl: result.url,
        fileName: file.name,
        fileType: file.raw.type,
        recipientId: selectedContact.value.id
      })
    }
  } catch (error) {
    console.error('文件上传失败:', error)
  }
}

const uploadToOss = async (file) => {
  // 实际项目中使用阿里云OSS上传
  // 这里模拟上传成功
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        url: URL.createObjectURL(file),
        name: file.name
      })
    }, 1000)
  })
}

const selectContact = (contact) => {
  selectedContact.value = contact
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.sidebar {
  width: 280px;
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
}

.user-info {
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.username {
  font-weight: bold;
  font-size: 16px;
}

.contact-list {
  flex: 1;
  overflow-y: auto;
}

.contact-item {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.contact-item:hover {
  background-color: #f5f7fa;
}

.contact-item.active {
  background-color: #ecf5ff;
}

.contact-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.contact-info {
  flex: 1;
  overflow: hidden;
}

.contact-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.contact-last-message {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 15px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.message {
  display: flex;
  margin-bottom: 20px;
}

.message-self {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: 0 10px;
}

.message-content {
  max-width: 60%;
}

.message-self .message-content {
  text-align: right;
}

.message-text {
  padding: 10px 15px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-break: break-word;
}

.message-self .message-text {
  background-color: #409eff;
  color: #fff;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.chat-input {
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #e6e6e6;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.ai-suggestion {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f0f9eb;
  border-radius: 4px;
  border-left: 3px solid #67c23a;
}

.suggestion-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-button {
  display: inline-block;
}
</style>