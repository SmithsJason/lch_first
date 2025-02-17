<template>
  <div class="container" ref="scrollContainer">
  <div class="column" v-for="(column, index) in columns" :key="index">
  <div class="item" v-for="(item, i) in column" :key="i">
  <img v-lazy="item.image" alt="random image" />
  <h3>{{ item.title }}</h3>
  <p>{{ item.description }}</p>
  </div>
  </div>
  <div v-if="loading" class="loading">Loading...</div>
  </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { debounce } from "lodash"; 
  
  export default {
  name: "App",
  setup() {
  const columns = ref([[], []]);
  const loading = ref(false);  
  const scrollContainer = ref(null);
  
  // 模拟生成图文数据
  const generateData = () => {
    const randomWidth = Math.floor(Math.random() * 400 + 200); // 随机图片宽度 200-600px
    const randomHeight = Math.floor(Math.random() * 200 + 150); // 随机图片高度 150-350px
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    return {
      image: `https://placehold.co/${randomWidth}x${randomHeight}.png/${randomColor}/ffffff?text=Image`,
      title: `Title ${Math.floor(Math.random() * 100)}`,
      description: `Description of the image, random content...`,
    };
  };
  
  // 加载新数据
  const loadMoreData = () => {
    loading.value = true; 
    setTimeout(() => { 
      for (let i = 0; i < 6; i++) {
        const newItem = generateData();

        if (columns.value[0].length <= columns.value[1].length) {
          columns.value[0].push(newItem);
        } else {
          columns.value[1].push(newItem);
        }
      }
      loading.value = false; 
    }, 1000); 
  };
  
  // 监听滚动事件
  const handleScroll = debounce(() => {
    const container = scrollContainer.value;
    if (
      container.scrollTop + container.clientHeight >= container.scrollHeight - 200
    ) {
      loadMoreData();
    }
  }, 300); 
  
  // 初始化数据
  onMounted(() => {
    loadMoreData(); 
    scrollContainer.value.addEventListener("scroll", handleScroll);
  });
  
  return {
    columns,
    scrollContainer,
    loading,
  };
  },
  };
  </script>
  
  <style scoped>
  .container {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  overflow-y: scroll;
  height: 100vh;
  flex-wrap: wrap;
  }
  
  .column {
  flex: 1 0 48%; 
  margin-bottom: 20px;
  }
  
  .item {
  margin-bottom: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .item img {
  width: 100%;
  height: auto;
  object-fit: cover;
  }
  
  .item h3 {
  padding: 10px;
  font-size: 18px;
  font-weight: bold;
  }
  
  .item p {
  padding: 10px;
  font-size: 14px;
  color: #666;
  }
  
  .loading {
  text-align: center;
  padding: 10px;
  font-size: 16px;
  color: #888;
  }
  </style>
