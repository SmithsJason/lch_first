import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // 存储所有聊天记录
  const conversations = ref({})
  
  // 当前选中的联系人ID
  const currentContactId = ref(null)
  
  // 获取当前联系人的聊天记录
  const currentMessages = computed(() => {
    if (!currentContactId.value || !conversations.value[currentContactId.value]) {
      return []
    }
    return conversations.value[currentContactId.value]
  })
  
  // 添加消息到聊天记录
  function addMessage(contactId, message) {
    if (!conversations.value[contactId]) {
      conversations.value[contactId] = []
    }
    conversations.value[contactId].push(message)
  }
  
  // 设置当前联系人
  function setCurrentContact(contactId) {
    currentContactId.value = contactId
  }
  
  // 初始化联系人的聊天记录
  function initConversation(contactId, messages = []) {
    conversations.value[contactId] = messages
  }
  
  return {
    conversations,
    currentContactId,
    currentMessages,
    addMessage,
    setCurrentContact,
    initConversation
  }
})