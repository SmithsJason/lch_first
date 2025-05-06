<template>
  <div class="edit-profile-container">
    <div class="profile-card">
      <h2 class="title">个人信息管理</h2>
      
      <!-- 头像上传区域 -->
      <div class="avatar-section">
        <div class="avatar-preview">
          <img :src="form.avatar || '/default-avatar.png'" class="avatar" @error="handleImageError" />
          <div class="upload-overlay">
            <input
              type="file"
              accept="image/*"
              @change="handleFileChange"
              class="file-input"
            />
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
          <el-input
            v-model="form.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="请输入新密码（留空不修改）"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>

        <el-button
          type="primary"
          class="submit-btn"
          :loading="isSubmitting"
          @click="submitForm"
        >
          保存修改
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import OSS from 'ali-oss'
const form = ref({
  avatar: '',
  username: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' }
  ],
  oldPassword: [
    { required: true, message: '需要验证当前密码', trigger: 'blur' }
  ]
}

const isSubmitting = ref(false)

const fetchUserInfo = async () => {
  try {
    const account = localStorage.getItem('account')
    const response = await axios.get('http://localhost:8080/api/user/info', {
      params: { account }
    })
    form.value = { ...response.data, oldPassword: '', newPassword: '', confirmPassword: '' }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
}

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (file) {
    try {
      const fileName = `avatars/${Date.now()}-${file.name}`
      const result = await ossClient.put(fileName, file)
      form.value.avatar = result.url
      ElMessage.success('头像更新成功')
    } catch (error) {
      ElMessage.error('头像上传失败')
    }
  }
}

const submitForm = async () => {
  try {
    isSubmitting.value = true
    const payload = {
      account: localStorage.getItem('account'),
      username: form.value.username,
      ...(form.value.newPassword && { newPassword: form.value.newPassword }),
      oldPassword: form.value.oldPassword
    }

    await axios.put('http://localhost:8080/api/user/update', payload)
    ElMessage.success('信息更新成功')
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '更新失败')
  } finally {
    isSubmitting.value = false
  }
}

const handleImageError = (event) => {
  event.target.src = '/default-avatar.png'
}

onMounted(fetchUserInfo)
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
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
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
}

.upload-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0,0,0,0.5);
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
  background: rgba(0,0,0,0.7);
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