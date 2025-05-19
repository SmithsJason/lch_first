<template>
  <div class="chat-view">
    <!-- 头部 -->
    <header class="chat-header">
      <div class="friend-info">
        <el-avatar :size="36" :src="defaultAvatar" class="friend-avatar" />
        <h2 class="friend-name">{{ friendName }}</h2>
        <span class="online-status" :class="{ 'online': friendOnline }">
          {{ friendOnline ? '在线' : '离线' }}
        </span>
      </div>
      <div class="header-actions">
        <el-button type="info" size="small" class="profile-btn" @click="showProfileDialog = true">
          查看资料
        </el-button>
        <el-button type="primary" size="small" @click="$router.back()">返回</el-button>
      </div>
    </header>

    <!-- 消息列表 -->
    <div class="chat-messages" ref="messageContainer">
      <div v-if="isLoading" class="loading">
        <el-icon :size="24" class="is-loading"><loading /></el-icon>
        加载中...
      </div>
      <div v-else-if="messages.length === 0" class="no-messages">
        暂无消息，开始聊天吧！
      </div>
      <div v-else class="message-list">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'message-item',
            { 'message-item--self': message.sender === currentUsername }
          ]"
        >
          <div class="message-content">
            <span class="sender">{{ message.sender }}</span>
            <p class="content">{{ message.content }}</p>
            <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="message-input-area">
      <el-input
        v-model="input"
        placeholder="输入消息..."
        type="textarea"
        :rows="2"
        resize="none"
        @keyup.enter="sendMessage"
      />
      <el-button
        type="primary"
        @click="sendMessage"
        :disabled="!input.trim() || isSending"
      >
        {{ isSending ? '发送中...' : '发送' }}
      </el-button>
    </div>

    <!-- 好友资料弹窗 -->
    <el-dialog
      title="好友资料"
      v-model="showProfileDialog"
      width="30%"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      custom-class="profile-dialog"
    >
      <div class="profile-content">
        <el-avatar :size="100" :src="defaultAvatar" />
        <div class="profile-info">
          <p><strong>用户名:</strong> {{ friendProfile.username || '未知' }}</p>
          <p><strong>账号:</strong> {{ friendProfile.account || '未知' }}</p>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showProfileDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage, ElInput, ElButton, ElDialog, ElAvatar, ElIcon } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const input = ref('');
const messages = ref([]);
const friendName = ref('加载中...');
const currentAccount = ref(localStorage.getItem('account') || '');
const currentUsername = ref(localStorage.getItem('username') || ''); 
const isLoading = ref(true);
const isSending = ref(false);
const messageContainer = ref(null);
const showProfileDialog = ref(false);
const friendProfile = ref({
  username: '',
  account: '',
  avatar: '',
});
const friendOnline = ref(false);
const defaultAvatar = new URL('@/assets/img/001.jpg', import.meta.url).href;
let ws = null;

// 格式化时间戳
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};
// 获取用户名通过账号
async function getUsernameByAccount(account) {
  try {
    const response = await axios.get(`http://localhost:8080/api/user/info`, {
      params: { account },
    });
    return response.data.username || '未知用户';
  } catch (error) {
    console.error('获取用户名失败:', error);
    return '未知用户';
  }
}

// 初始化 WebSocket 连接
function initWebSocket(account) {
  ws = new WebSocket(`ws://localhost:8080/chat?account=${account}`);

  ws.onopen = () => {
    console.log('WebSocket 连接已建立');
    ElMessage.success('已连接到聊天服务器');
  };

  ws.onmessage = async (event) => {
    const message = event.data;
    if (message.startsWith('ONLINE_USERS:')) {
      const [, , users] = message.split(':');
      const userList = users ? users.split(',') : [];
      friendOnline.value = userList.includes(friendProfile.value.username);
      console.log(`好友在线状态更新: ${friendProfile.value.username} ${friendOnline.value ? '在线' : '离线'}`);
    } else {
      const [senderAccount, content] = message.split(': ', 2);
      const senderUsername = await getUsernameByAccount(senderAccount);
      if (senderAccount === friendProfile.value.account && senderAccount !== currentAccount.value) {
        messages.value.push({
          id: Date.now() + Math.random(),
          sender: senderUsername, 
          content,
          timestamp: new Date().toISOString(),
          isNew: true,
        });
        setTimeout(() => {
          messages.value = messages.value.map(msg => ({
            ...msg,
            isNew: false
          }));
        }, 1000);
        nextTick(() => {
          messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
        });
      }
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket 错误:', error);
    ElMessage.error('聊天连接失败，请稍后重试');
  };

  ws.onclose = () => {
    ElMessage.warning('聊天连接已断开');
    friendOnline.value = false;
  };
}

// 获取好友信息
async function fetchFriendInfo(account) {
  try {
    const response = await axios.get(`http://localhost:8080/api/user/info`, {
      params: { account },
    });
    friendName.value = response.data.username || '未知用户';
    friendProfile.value = {
      username: response.data.username || '未知',
      account: account,
      avatar: response.data.avatar || defaultAvatar,
    };
  } catch (error) {
    console.error('获取好友信息失败:', error);
    ElMessage.error('获取好友信息失败');
    friendName.value = '未知用户';
  }
}

// 获取历史消息
async function fetchMessages(friendAccount) {
  try {
    const response = await axios.get(`http://localhost:8080/api/messages`, {
      params: {
        sender: currentAccount.value,
        receiver: friendAccount,
      },
    });
    // Changed: Map sender account to username for each message
    messages.value = await Promise.all(
      response.data.messages?.map(async (msg) => ({
        ...msg,
        sender: await getUsernameByAccount(msg.sender), // Map account to username
        timestamp: msg.timestamp || new Date().toISOString(),
        isNew: false,
      })) || []
    );
  } catch (error) {
    console.error('获取消息失败:', error);
    ElMessage.error('获取消息失败');
  }
}

// 发送消息
async function sendMessage() {
  if (!input.value.trim()) {
    ElMessage.warning('请输入消息内容');
    return;
  }
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    ElMessage.error('聊天服务器未连接');
    return;
  }
  isSending.value = true;
  try {
    ws.send(input.value);
    messages.value.push({
      id: Date.now(),
      sender: currentUsername.value, // Use currentUsername
      content: input.value,
      timestamp: new Date().toISOString(),
      isNew: true,
    });
    setTimeout(() => {
      messages.value = messages.value.map(msg => ({
        ...msg,
        isNew: false
      }));
    }, 1000);
    input.value = '';
    ElMessage.success('消息已发送');
    nextTick(() => {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error('发送消息失败');
  } finally {
    isSending.value = false;
  }
}

// 组件初始化
onMounted(async () => {
  const account = route.params.account;
  if (!account) {
    console.error('缺少路由参数中的好友账号');
    friendName.value = '未知用户';
    ElMessage.error('无效的好友账号');
    router.push({ name: 'Friends' });
    return;
  }
  if (!currentAccount.value || !currentUsername.value) { // Check currentUsername
    ElMessage.error('未登录，请先登录');
    router.push({ name: 'Login' });
    return;
  }

  isLoading.value = true;
  try {
    await Promise.all([
      fetchFriendInfo(account),
      fetchMessages(account),
    ]);
    initWebSocket(currentAccount.value);
    await nextTick();
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  } finally {
    isLoading.value = false;
  }
});

// 组件销毁时清理 WebSocket
onUnmounted(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
});
</script>
<style scoped>
.chat-view {
  max-width: 960px;
  margin: 24px auto;
  padding: 16px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 96px);
  transition: all 0.3s ease;
}

/* 头部 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  border-radius: 16px 16px 0 0;
  border-bottom: 1px solid #d1d9e6;
}

.friend-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.friend-name {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.5px;
}

.online-status {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  background: #e0f2fe;
  padding: 4px 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.online-status::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #94a3b8;
}

.online-status.online::before {
  background-color: #22c55e;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.profile-btn {
  background-color: #38bdf8 !important;
  border-color: #38bdf8 !important;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.profile-btn:hover {
  background-color: #0284c7 !important;
  transform: translateY(-1px);
}

/* 消息列表 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8fafc;
  scroll-behavior: smooth;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  padding: 20px;
  font-size: 16px;
  font-weight: 500;
}

.no-messages {
  text-align: center;
  color: #64748b;
  padding: 20px;
  font-size: 16px;
  font-weight: 500;
  opacity: 0.8;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  flex-direction: column;
  opacity: 1;
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.message-item.new-message {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeIn 0.5s ease forwards;
}

.message-item--self {
  align-items: flex-end;
}

.message-content {
  background: #ffffff;
  padding: 10px 16px;
  border-radius: 12px 12px 12px 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  max-width: 75%;
  word-wrap: break-word;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.message-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
}

.message-item--self .message-content {
  background: #0284c7;
  color: #ffffff;
  border-radius: 12px 12px 4px 12px;
}

.message-item--self .sender,
.message-item--self .timestamp {
  color: #e0f2fe;
}

.sender {
  font-weight: 600;
  color: #0284c7;
  font-size: 13px;
  letter-spacing: 0.2px;
}

.content {
  margin: 6px 0;
  font-size: 15px;
  line-height: 1.5;
  color: #1e293b;
}

.timestamp {
  font-size: 11px;
  color: #94a3b8;
  text-align: right;
  opacity: 0.8;
}

/* 消息输入区 */
.message-input-area {
  display: flex;
  gap: 10px;
  padding: 14px 20px;
  background: #eceff4;
  border-top: 1px solid #d1d9e6;
  border-radius: 0 0 16px 16px;
  align-items: center;
}

.message-input-area .el-input {
  flex: 1;
  border-radius: 8px;
  background: #ffffff;
  transition: border-color 0.3s ease;
}

.message-input-area .el-button {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s ease;
}

.message-input-area .el-button:hover {
  transform: translateY(-1px);
}

/* 资料弹窗 */
.profile-dialog {
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  animation: slideIn 0.3s ease;
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.profile-info {
  text-align: center;
  width: 100%;
}

.profile-info p {
  margin: 8px 0;
  font-size: 15px;
  color: #1e293b;
  line-height: 1.5;
}

.profile-info p strong {
  color: #1e293b;
  font-weight: 600;
}

.el-avatar {
  border: 2px solid #bae6fd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.el-avatar:hover {
  transform: scale(1.05);
}

/* 动画 */
@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 600px) {
  .chat-view {
    margin: 10px;
    padding: 10px;
    height: calc(100vh - 80px);
    border-radius: 12px;
  }

  .chat-header {
    padding: 10px 14px;
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .friend-name {
    font-size: 20px;
  }

  .friend-info {
    width: 100%;
    justify-content: space-between;
  }

  .online-status {
    font-size: 12px;
    padding: 3px 8px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
    gap: 8px;
  }

  .message-content {
    max-width: 80%;
    padding: 8px 14px;
  }

  .message-input-area {
    flex-direction: column;
    padding: 10px 14px;
    gap: 8px;
  }

  .message-input-area .el-button {
    width: 100%;
    padding: 10px;
  }

  .profile-dialog {
    width: 90%;
  }

  .profile-content {
    padding: 16px;
  }

  .el-avatar {
    size: 80px;
  }
}
</style>