<template>
    <div class="ai-view">
      <h2>AI助手</h2>
      <el-input v-model="aiInput" placeholder="问我任何问题" @keyup.enter="ask" />
      <div v-if="aiResponse" class="ai-response">{{ aiResponse }}</div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  defineProps({
    aiResponse: String
  });
  defineEmits(['ask-ai']);
  
  const aiInput = ref('');
  
  const ask = () => {
    if (aiInput.value.trim()) {
      emit('ask-ai', aiInput.value);
      aiInput.value = '';
    }
  };
  </script>
  
  <style scoped>
  .ai-view {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
  }
  .ai-response {
    margin-top: 20px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 5px;
  }
  </style>