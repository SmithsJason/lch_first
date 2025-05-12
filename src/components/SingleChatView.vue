<template>
    <div class="chat-view">
      <!-- Header -->
      <header class="chat-header">
        <h2 class="friend-name">与 {{ friendName }} 聊天</h2>
        <el-button type="primary" size="small" @click="$router.back()">返回</el-button>
      </header>
  
      <!-- Chat Messages -->
      <div class="chat-messages">
        <div v-if="messages.length === 0" class="no-messages">
          暂无消息，开始聊天吧！
        </div>
        <div v-else class="message-list">
          <div v-for="message in messages" :key="message.id" class="message-item">
            <div class="message-content">
              <span class="sender">{{ message.sender }}</span>
              <p class="content">{{ message.content }}</p>
              <span class="timestamp">{{ message.timestamp }}</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Message Input -->
      <div class="message-input-area">
        <el-input
          v-model="input"
          placeholder="输入消息..."
          type="textarea"
          :rows="2"
          resize="none"
          @keyup.enter="sendMessage"
        />
        <el-button type="primary" @click="sendMessage" :disabled="!input.trim()">
          发送
        </el-button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axios from 'axios';
  import { ElMessage, ElInput, ElButton } from 'element-plus';
  
  const route = useRoute();
  const router = useRouter();
  const input = ref('');
  const messages = ref([]);
  const friendName = ref('加载中...');
  const currentAccount = ref(localStorage.getItem('account') || '');
  
  async function fetchFriendInfo(account) {
    try {
      const response = await axios.get(`http://localhost:8080/api/user/${account}`);
      friendName.value = response.data.data.username || account;
    } catch (error) {
      console.error('获取好友信息失败:', error);
      friendName.value = account;
      ElMessage.error('获取好友信息失败');
    }
  }
  
  async function fetchMessages(friendAccount) {
    try {
      const response = await axios.get(`http://localhost:8080/api/messages`, {
        params: {
          sender: currentAccount.value,
          receiver: friendAccount,
        },
      });
      messages.value = response.data.messages || [];
    } catch (error) {
      console.error('获取消息失败:', error);
      ElMessage.error('获取消息失败');
    }
  }
  
  async function sendMessage() {
    if (!input.value.trim()) {
      ElMessage.warning('请输入消息内容');
      return;
    }
    try {
      const response = await axios.post(`http://localhost:8080/api/messages`, {
        sender: currentAccount.value,
        receiver: route.params.account,
        content: input.value,
      });
      messages.value.push({
        id: response.data.id || Date.now(),
        sender: currentAccount.value,
        content: input.value,
        timestamp: new Date().toLocaleString('zh-CN'),
      });
      input.value = '';
      ElMessage.success('消息已发送');
    } catch (error) {
      console.error('发送消息失败:', error);
      ElMessage.error('发送消息失败');
    }
  }
  
  onMounted(async () => {
    const account = route.params.account;
    if (!account) {
      console.error('Missing friend account in route params');
      friendName.value = '未知用户';
      ElMessage.error('无效的好友账号');
      router.push({ name: 'Friends' }); // Redirect to friends list
      return;
    }
    if (!currentAccount.value) {
      ElMessage.error('未登录，请先登录');
      router.push({ name: 'Login' });
      return;
    }
    await Promise.all([
      fetchFriendInfo(account),
      fetchMessages(account),
    ]);
  });
  </script>
  
  <style scoped>
  .chat-view {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    height: calc(100vh - 60px);
  }
  
  /* Header */
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background: #f5f5f5;
    border-radius: 8px 8px 0 0;
    border-bottom: 1px solid #eee;
  }
  
  .friend-name {
    margin: 0;
    font-size: 20px;
    color: #333;
  }
  
  /* Chat Messages */
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #fafafa;
  }
  
  .no-messages {
    text-align: center;
    color: #666;
    padding: 20px;
    font-size: 16px;
  }
  
  .message-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .message-item {
    display: flex;
    flex-direction: column;
  }
  
  .message-content {
    background: #fff;
    padding: 10px 15px;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    max-width: 70%;
    word-wrap: break-word;
  }
  
  .sender {
    font-weight: bold;
    color: #007bff;
    font-size: 14px;
  }
  
  .content {
    margin: 5px 0;
    font-size: 16px;
    color: #333;
  }
  
  .timestamp {
    font-size: 12px;
    color: #999;
    text-align: right;
  }
  
  /* Message Input */
  .message-input-area {
    display: flex;
    gap: 10px;
    padding: 10px 20px;
    background: #f5f5f5;
    border-top: 1px solid #eee;
    border-radius: 0 0 8px 8px;
  }
  
  .message-input-area .el-input {
    flex: 1;
  }
  
  .message-input-area .el-button {
    padding: 10px 20px;
  }
  
  /* Responsive Design */
  @media (max-width: 600px) {
    .chat-view {
      margin: 10px;
      padding: 10px;
      height: calc(100vh - 40px);
    }
  
    .chat-header {
      padding: 10px;
    }
  
    .friend-name {
      font-size: 18px;
    }
  
    .message-content {
      max-width: 85%;
    }
  
    .message-input-area {
      flex-direction: column;
    }
  
    .message-input-area .el-button {
      width: 100%;
    }
  }
  </style>