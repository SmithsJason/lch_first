import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getChatHistory, sendMessage } from '../services/chatService'
import { getAiResponse } from '../services/deepseekService'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const contacts = ref([])
  const messages = ref({})
  const selectedContactId = ref(null)
  const isLoading = ref(false)

  // 计算属性
  const selectedContact = computed(() => {
    return contacts.value.find(contact => contact.id === selectedContactId.value) || null
  })

  const currentMessages = computed(() => {
    return messages.value[selectedContactId.value] || []
  })

  // 方法
  const setContacts = (newContacts) => {
    contacts.value = newContacts
  }

  const selectContact = (contactId) => {
    selectedContactId.value = contactId
    if (!messages.value[contactId]) {
      loadMessages(contactId)
    }
  }

  const loadMessages = async (contactId) => {
    isLoading.value = true
    try {
      const history = await getChatHistory(contactId)
      messages.value[contactId] = history
    } catch (error) {
      console.error('加载消息失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const addMessage = (contactId, message) => {
    if (!messages.value[contactId]) {
      messages.value[contactId] = []
    }
    messages.value[contactId].push(message)
    
    // 更新联系人最后一条消息
    const index = contacts.value.findIndex(c => c.id === contactId)
    if (index !== -1) {
      contacts.value[index].lastMessage = message.text
    }
  }

  const sendMessageToContact = async (text, contactId) => {
    const message = {
      id: Date.now(),
      text,
      senderId: 'current-user-id', // 应该从认证存储中获取
      timestamp: new Date()
    }
    
    addMessage(contactId, message)
    
    // 发送消息到服务器
    sendMessage({
      text,
      recipientId: contactId
    })
    
    // 如果是AI联系人，获取AI回复
    const contact = contacts.value.find(c => c.id === contactId)
    if (contact && contact.isAi) {
      const aiMessage = await getAiResponse(text, currentMessages.value)
      const response = {
        id: Date.now() + 1,
        text: aiMessage,
        senderId: contactId,
        timestamp: new Date()
      }
      addMessage(contactId, response)
    }
  }

  return {
    contacts,
    messages,
    selectedContactId,
    isLoading,
    selectedContact,
    currentMessages,
    setContacts,
    selectContact,
    loadMessages,
    addMessage,
    sendMessageToContact
  }
})