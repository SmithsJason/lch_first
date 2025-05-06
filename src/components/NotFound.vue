<!-- src/components/NotFound.vue -->
<template>
    <div class="not-found">
      <h1>404 - 页面未找到</h1>
      <p>您访问的页面不存在，请检查 URL 或返回首页。</p>
      <el-button type="primary" @click="$router.push('/chat')">返回聊天首页</el-button>
    </div>
  </template>
  
  <style scoped>
  .not-found {
    text-align: center;
    padding: 50px;
  }
  </style>