# Vue 3 WebSocket 聊天系统

这是一个基于 Vue 3、WebSocket 和 DeepSeek API 的在线聊天系统。

## 功能特点

- 用户认证和登录
- 实时聊天（WebSocket）
- 联系人列表
- 消息历史记录
- 阿里云 OSS 存储聊天内容
- DeepSeek API 集成，提供智能回复和热门话题建议

## 技术栈

- Vue 3 + Composition API
- Vite
- Pinia 状态管理
- Vue Router
- Element Plus UI 组件库
- Socket.io 客户端
- Axios HTTP 客户端
- 阿里云 OSS SDK

## 项目设置

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 生产环境构建

```bash
npm run build
```

## 配置

### WebSocket 服务器

在 `src/services/chatService.js` 中配置 WebSocket 服务器地址。

### 阿里云 OSS

在 `src/services/ossService.js` 中配置阿里云 OSS 参数：

```javascript
const ossConfig = {
  region: 'your-region',
  accessKeyId: 'your-access-key-id',
  accessKeySecret: 'your-access-key-secret',
  bucket: 'your-bucket-name'
}
```

### DeepSeek API

在 `src/services/deepseekService.js` 中配置 DeepSeek API 调用。

## 项目结构

- `src/views/` - 页面组件
- `src/components/` - 可复用组件
- `src/services/` - API 和服务
- `src/stores/` - Pinia 状态管理
- `src/router/` - 路由配置

## 后续开发计划

- 添加群聊功能
- 支持图片和文件发送
- 添加消息通知
- 优化移动端体验