<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { ElMessage, ElInput, ElButton } from 'element-plus';

const route = useRoute();
const groupName = ref('加载中...');
const messageInput = ref('');
const messages = ref([]); // Placeholder for chat messages

async function fetchGroupInfo(id) {
  try {
    const response = await axios.get(`http://localhost:8080/api/group/groups/${id}`);
    console.log('Group info response:', response.data);
    groupName.value = response.data.data.name;
  } catch (error) {
    console.error('获取群聊信息失败:', error);
    groupName.value = '未知群聊';
    ElMessage.error('获取群聊信息失败');
  }
}

const sendMessage = () => {
  if (!messageInput.value.trim()) {
    ElMessage.warning('请输入消息内容');
    return;
  }
  // Placeholder: Add message to messages array (extend with actual backend API call)
  messages.value.push({
    id: Date.now(),
    content: messageInput.value,
    sender: 'You', // Replace with actual user account
    timestamp: new Date().toLocaleString('zh-CN'),
  });
  messageInput.value = '';
  // TODO: Call backend API to send message
  ElMessage.success('消息已发送');
};

onMounted(() => {
  const id = route.params.id;
  if (!id) {
    console.error('Missing group id in route params');
    groupName.value = '未知群聊';
    ElMessage.error('无效的群聊ID');
    return;
  }
  fetchGroupInfo(id);
});
</script>

<template>
  <div class="group-chat-view">
    <!-- Header -->
    <header class="chat-header">
      <h2 class="group-name">群聊：{{ groupName }}</h2>
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
        v-model="messageInput"
        placeholder="输入消息..."
        type="textarea"
        :rows="2"
        resize="none"
        @keyup.enter="sendMessage"
      />
      <el-button type="primary" @click="sendMessage" :disabled="!messageInput.trim()">
        发送
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.group-chat-view {
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

.group-name {
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
  .group-chat-view {
    margin: 10px;
    padding: 10px;
    height: calc(100vh - 40px);
  }

  .chat-header {
    padding: 10px;
  }

  .group-name {
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