<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="title">用户注册</h2>
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="input-group">
          <label class="input-label">账号</label>
          <input v-model="account" type="text" class="tech-input" placeholder="请输入8位数字账号" required
            @input="validateAccount" />
        </div>
        <div class="input-group">
          <label class="input-label">密码</label>
          <input v-model="password" type="password" class="tech-input" placeholder="请输入密码" required />
        </div>
        <div class="input-group">
          <label class="input-label">确认密码</label>
          <input v-model="confirmPassword" type="password" class="tech-input" placeholder="请再次输入密码" required />
        </div>
        <div class="input-group">
          <label class="input-label">用户名</label>
          <input v-model="username" type="text" class="tech-input" placeholder="请输入用户名" required />
        </div>
        <div class="input-group">
          <label class="input-label">头像</label>
          <input type="file" class="tech-file-input" @change="handleFileChange" accept="image/*" />
        </div>
        <button type="submit" class="tech-button" :disabled="isUploading || !isFormValid">
          立即注册
        </button>
        <p class="login-link">
          已有账号？
          <a href="#" class="link" @click.prevent="$emit('to-login')">去登录</a>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'
import axios from 'axios';
import { ElMessage } from 'element-plus';
import OSS from 'ali-oss';

const router = useRouter()
const account = ref('');
const password = ref('');
const confirmPassword = ref('');
const username = ref('');
const avatar = ref('');
const isUploading = ref(false);

if (!OSS) {
  console.error('OSS SDK 未正确加载，请检查 ali-oss 是否安装');
}



const validateAccount = () => {
  // 移除非数字字符
  account.value = account.value.replace(/\D/g, '');
  // 限制长度为8位
  if (account.value.length > 8) {
    account.value = account.value.slice(0, 8);
  }
};

// 表单验证
const isFormValid = computed(() => {
  const accountValid = /^\d{8}$/.test(account.value);
  const passwordMatch = password.value === confirmPassword.value && password.value.length > 0;
  return accountValid && passwordMatch && username.value.length > 0;
});

const uploadToOSS = async (file) => {
  try {
    const fileName = `avatars/${Date.now()}-${file.name}`;
    const result = await ossClient.put(fileName, file);
    return result.url;
  } catch (error) {
    console.error('上传到OSS失败:', error);
    throw error;
  }
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      isUploading.value = true;
      ElMessage.info('头像上传中...');
      const url = await uploadToOSS(file);
      avatar.value = url;
      ElMessage.success('头像上传成功');
    } catch (error) {
      ElMessage.error('头像上传失败: ' + error.message);
    } finally {
      isUploading.value = false;
    }
  }
};

const handleRegister = async () => {
  if (!isFormValid.value) {
    ElMessage.error('请检查输入：账号必须为8位数字，且密码必须一致');
    return;
  }

  try {
    const userData = {
      account: account.value,
      password: password.value,
      username: username.value,
      avatar: avatar.value
    };

    const response = await axios.post('/api/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    ElMessage.success('注册成功');
    router.push('/chat');
  } catch (error) {
    ElMessage.error('注册失败: ' + (error.response?.data?.message || error.message));
    console.error('注册失败:', error.response?.data || error);
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.register-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 0 25px rgba(0, 229, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.title {
  color: #00e5ff;
  text-align: center;
  margin-bottom: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 1.8rem;
  font-weight: 300;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.input-label {
  color: #e0e0e0;
  font-size: 1rem;
  width: 80px;
  text-align: right;
}

.tech-input,
.tech-file-input {
  flex: 1;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 10px;
  color: #ffffff;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.tech-input:focus,
.tech-file-input:focus {
  outline: none;
  border-color: #00e5ff;
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.3);
}

.tech-file-input {
  padding: 12px 18px;
  cursor: pointer;
}

.tech-file-input:hover {
  border-color: #00e5ff;
}

.tech-button {
  background: linear-gradient(45deg, #00e5ff, #00b7d4);
  border: none;
  border-radius: 10px;
  padding: 14px;
  color: #ffffff;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.tech-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tech-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 229, 255, 0.4);
}

.login-link {
  color: #b0b0b0;
  text-align: center;
  font-size: 1rem;
  margin-top: 1.5rem;
}

.link {
  color: #00e5ff;
  text-decoration: none;
  transition: all 0.3s ease;
}

.link:hover {
  text-decoration: underline;
  color: #00b7d4;
}
</style>