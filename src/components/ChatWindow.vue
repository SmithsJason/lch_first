<template>
    <div class="chat-window">
      <div class="chat-header">
        <h2>{{ friendUsername || '聊天' }}</h2>
        <button @click="goBack">返回</button>
      </div>
      <div class="chat-messages" ref="messageContainer">
        <div v-for="message in messages" :key="message.id" :class="['message', message.sender === currentAccount ? 'sent' : 'received']">
          <div class="message-content">
            <p>{{ message.content }}</p>
            <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <input v-model="newMessage" placeholder="输入消息..." @keyup.enter="sendMessage" />
        <button @click="sendMessage" :disabled="!newMessage.trim()">发送</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
 
  
  const route = useRoute();
  const router = useRouter();
  const currentAccount = ref(localStorage.getItem('account') || '');
  const friendAccount = ref(route.params.friendAccount);
  const friendUsername = ref('');
  const messages = ref([]);
  const newMessage = ref('');
  const messageContainer = ref(null);
  let ws = null;
  
  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };
  
  // 获取好友信息
  const fetchFriendInfo = async () => {
    try {
      const response = await fetchUserInfo(friendAccount.value);
      friendUsername.value = response.username;
    } catch (error) {
      ElMessage.error('获取好友信息失败');
    }
  };
  
  // 初始化 WebSocket
  const initWebSocket = () => {
    ws = new WebSocket(`ws://localhost:8080/ws?account=${currentAccount.value}`);
    
    ws.onopen = () => {
      console.log('WebSocket 连接已建立');
    };
  
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.sender === friendAccount.value || message.receiver === friendAccount.value) {
        messages.value.push({
          id: Date.now() + Math.random(), // 临时 ID，建议由后端提供
          ...message,
        });
        scrollToBottom();
      }
    };
  
    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
      ElMessage.error('WebSocket 连接失败');
    };
  
    ws.onclose = () => {
      console.log('WebSocket 连接已关闭');
    };
  };
  
  // 发送消息
  const sendMessage = () => {
    if (!newMessage.value.trim()) return;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      ElMessage.error('WebSocket 未连接');
      return;
    }
  
    const message = {
      sender: currentAccount.value,
      receiver: friendAccount.value,
      content: newMessage.value,
      timestamp: new Date().toISOString(),
    };
  
    ws.send(JSON.stringify(message));
    messages.value.push({
      id: Date.now() + Math.random(), // 临时 ID
      ...message,
    });
    newMessage.value = '';
    scrollToBottom();
  };
  
  // 滚动到底部
  const scrollToBottom = async () => {
    await nextTick();
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  };
  
  // 返回好友列表
  const goBack = () => {
    router.push('/chat/friends');
  };
  
  // 生命周期
  onMounted(async () => {
    if (!currentAccount.value) {
      ElMessage.error('未登录，请先登录');
      router.push('/');
      return;
    }
    await fetchFriendInfo();
    initWebSocket();
  });
  
  onUnmounted(() => {
    if (ws) {
      ws.close();
      ws = null;
    }
  });
  </script>
  
  <style scoped>
  .chat-window {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 800px;
    margin: 0 auto;
    background: #f0f2f5;
  }
  
  .chat-header {
    padding: 10px 20px;
    background: #fff;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .chat-messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: #f0f2f5;
  }
  
  .message {
    display: flex;
    margin-bottom: 10px;
  }
  
  .message.sent {
    justify-content: flex-end;
  }
  
  .message.received {
    justify-content: flex-start;
  }
  
  .message-content {
    max-width: 60%;
    padding: 10px;
    border-radius: 8px;
    position: relative;
  }
  
  .message.sent .message-content {
    background: #d1f4cc;
  }
  
  .message.received .message-content {
    background: #fff;
  }
  
  .message-content p {
    margin: 0;
    word-break: break-word;
  }
  
  .timestamp {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
    display: block;
    text-align: right;
  }
  
  .chat-input {
    display: flex;
    padding: 10px 20px;
    background: #fff;
    border-top: 1px solid #ddd;
  }
  
  .chat-input input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-right: 10px;
  }
  
  .chat-input button {
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .chat-input button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .chat-input button:hover:not(:disabled) {
    background: #0056b3;
  }
  </style>