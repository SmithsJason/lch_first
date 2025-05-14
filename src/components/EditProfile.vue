<template>
  <div class="edit-profile-container">
    <div class="profile-card">
      <h2 class="title">个人信息管理</h2>
      <!-- 头像上传区域 -->
      <div class="avatar-section">
        <div class="avatar-preview">
          <img :src="form.avatar || defaultAvatar" class="avatar" @error="handleImageError" />
          <div class="upload-overlay">
            <input type="file" accept="image/*" @change="handleFileChange" class="file-input" />
            <i class="el-icon-upload"></i>
          </div>
        </div>
      </div>

      <!-- 个人信息表单 -->
      <el-form :model="form" :rules="rules" ref="profileForm" class="profile-form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入新用户名" />
        </el-form-item>

        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="form.oldPassword" type="password" placeholder="请输入旧密码" @blur="checkOldPassword" />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="form.newPassword" type="password" placeholder="请输入新密码（留空不修改）" show-password />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>

        <el-button type="primary" class="submit-btn" :loading="isSubmitting" @click="submitForm">
          保存修改
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

// 默认头像路径
const defaultAvatar = new URL('@/assets/img/001.jpg', import.meta.url).href;

const form = ref({
  avatar: '',
  username: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const rules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
  ],
  oldPassword: [
    { required: true, message: '需要验证当前密码', trigger: 'blur' },
  ],
  confirmPassword: [
    {
      validator: (rule, value, callback) => {
        if (form.value.newPassword && !value) {
          callback(new Error('请再次输入新密码'));
        } else if (form.value.newPassword && value !== form.value.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const isSubmitting = ref(false);
const isUploading = ref(false);

const fetchUserInfo = async () => {
  try {
    const account = localStorage.getItem('account');
    if (!account) {
      throw new Error('未登录，请先登录');
    }
    const response = await axios.get('http://localhost:8080/api/user/info', {
      params: { account },
    });
    console.log('用户信息:', response.data);
    form.value = {
      avatar: response.data.avatar || '',
      username: response.data.username || '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  } catch (error) {
    ElMessage.error(error.message || '获取用户信息失败');
  }
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      isUploading.value = true;
      ElMessage.info('头像上传中...');

      // 使用 FormData 发送文件到后端
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post('http://localhost:8080/api/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 后端返回图片的 URL
      form.value.avatar = response.data.url;
      ElMessage.success('头像上传成功');
    } catch (error) {
      ElMessage.error('头像上传失败: ' + (error.response?.data?.message || error.message));
      console.error('上传失败:', error);
    } finally {
      isUploading.value = false;
    }
  }
};

const handleImageError = (event) => {
  console.warn('头像加载失败，使用默认头像');
  event.target.src = defaultAvatar;
};

const checkOldPassword = async () => {
  if (!form.value.oldPassword) return;
  try {
    const account = localStorage.getItem('account');
    const response = await axios.post('http://localhost:8080/api/user/check-password', {
      account,
      oldPassword: form.value.oldPassword,
    });

    if (response.data.code === 200) {
      ElMessage.success('旧密码验证成功');
    } else {
      ElMessage.error('旧密码输入错误，请重新输入');
      form.value.oldPassword = '';
    }
  } catch (error) {
    console.error('检查旧密码失败:', error);
    ElMessage.error(error.response?.data?.message || '检查旧密码失败，请稍后重试');
    form.value.oldPassword = '';
  }
};

const submitForm = async () => {
  try {
    // 验证表单
    await profileForm.value.validate();

    isSubmitting.value = true;
    const account = localStorage.getItem('account');
    if (!account) {
      throw new Error('未登录，请先登录');
    }

    const payload = {
      account,
      username: form.value.username,
      avatar: form.value.avatar || '',
      ...(form.value.newPassword && { newPassword: form.value.newPassword }),
    };

    const response = await axios.put('http://localhost:8080/api/user/update', payload);
    ElMessage.success('信息更新成功');
    // 延迟刷新页面
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '更新失败');
    console.error('更新失败:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// 引用表单实例
const profileForm = ref(null);

// 组件挂载时获取用户信息
onMounted(fetchUserInfo);
</script>

<style scoped>
.edit-profile-container {
  padding: 30px;
  max-width: 600px;
  margin: 0 auto;
}

.profile-card {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-preview {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid #f0f0f0;
  object-fit: cover;
}

.upload-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-overlay:hover {
  background: rgba(0, 0, 0, 0.7);
}

.file-input {
  opacity: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.profile-form {
  margin-top: 20px;
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
  padding: 15px;
}
</style>