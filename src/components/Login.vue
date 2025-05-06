<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="title">系统登录</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label class="input-label">账号</label>
          <input 
            v-model="account" 
            type="text" 
            class="tech-input"
            placeholder="请输入账号"
            required 
          />
        </div>
        <div class="input-group">
          <label class="input-label">密码</label>
          <input 
            v-model="password" 
            type="password" 
            class="tech-input"
            placeholder="请输入密码"
            required 
          />
        </div>
        <button type="submit" class="tech-button">立即登录</button>
        <p class="register-link">
          没有账号？
          <router-link to="/register" class="link">注册新账户</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { loginApi } from '@/api/auth';

const account = ref(''); 
const password = ref('');
const router = useRouter();

const handleLogin = async () => {
  try {
    const response = await loginApi(account.value, password.value);
    if (response.success) {
      localStorage.setItem('token', response.data.token || '');
      localStorage.setItem('account', account.value); 
      router.push({ path: '/chat', query: { account: account.value } });
      ElMessage.success('登录成功');
    } else {
      ElMessage.error('账号或密码错误，请重试！');
    }
  } catch (error) {
    ElMessage.error('登录失败');
    console.error(error);
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-card {
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

.login-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.input-label {
  color: #e0e0e0;
  font-size: 1rem;
  width: 60px;
  text-align: right;
}

.tech-input {
  flex: 1;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 10px;
  color: #ffffff;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.tech-input:focus {
  outline: none;
  border-color: #00e5ff;
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.3);
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

.tech-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 229, 255, 0.4);
}

.register-link {
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