import { createApp } from 'vue';  // 确保只导入一次 createApp
import App from './App.vue';
import VueLazyload from 'vue-lazyload';  // 导入懒加载插件

createApp(App)
  .use(VueLazyload)  // 使用懒加载插件
  .mount('#app');
