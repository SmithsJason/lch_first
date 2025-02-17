
Vue 3 无限滚动与懒加载
本项目展示了如何在 Vue 3 中实现无限滚动功能。当用户滚动到页面底部时，自动加载新的数据。同时，结合 vue-lazyload 插件实现图片的懒加载，提升页面加载速度和用户体验。

特性
无限滚动：当用户向下滚动页面时，数据会自动加载。
懒加载：图片只有在进入视口时才会加载，从而提升页面加载速度和用户体验。
响应式列布局：内容以两列的形式展示，支持自适应不同屏幕尺寸的布局。
加载动画与提示：在加载新数据时，会显示加载动画和提示。

功能实现
图片懒加载
本项目使用了 v-lazy 指令实现图片的懒加载。只有当图片进入视口时，它才会被加载，这样可以减少不必要的网络请求，提升页面性能。

无限滚动
当用户滚动到页面底部时，新的数据会被动态加载并显示。数据由随机生成的图片 URL、标题和描述组成。滚动事件使用了防抖处理，避免过于频繁的加载请求。

模拟数据加载
每次加载的新数据包含随机生成的图片 URL、标题和描述。内容展示采用了两列的响应式布局，确保不同屏幕尺寸下均能良好显示。

项目结构
src/
├── assets/              # 存放静态资源（如图片等）
├── components/          # 组件目录
│   ├── App.vue          # 主组件
│   ├── main.js          # 项目入口文件
│   └── style.css        # 全局样式（可选）
└── views/               # 页面视图
工作原理
数据加载：页面加载时会生成初始的随机数据，并展示在页面中。
滚动事件：当用户滚动页面时，触发滚动事件检查是否接近页面底部。如果接近底部，调用 loadMoreData 函数加载更多数据。
防抖处理：为了避免过于频繁的加载请求，滚动事件使用了防抖处理。
使用的库
Vue 3：用于构建应用的核心框架。
Lodash：一个实用工具库，用于处理防抖等操作。
vue-lazyload：用于实现图片懒加载功能。
