"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vueRouter = require("vue-router");

var _ChatView = _interopRequireDefault(require("../components/ChatView.vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var routes = [{
  path: '/chat',
  component: _ChatView["default"],
  meta: {
    requiresAuth: true
  },
  children: [{
    path: 'friends',
    name: 'Friends',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/components/FriendsView.vue'));
      });
    }
  }, {
    path: 'ai',
    name: 'AI',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/components/AIView.vue'));
      });
    }
  }, {
    path: 'profile',
    name: 'EditProfile',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/components/EditProfile.vue'));
      });
    }
  }, {
    path: ':friendAccount',
    name: 'ChatWindow',
    component: function component() {
      return Promise.resolve().then(function () {
        return _interopRequireWildcard(require('@/components/ChatWindow.vue'));
      });
    }
  }]
}, {
  path: '/',
  name: 'Login',
  component: function component() {
    return Promise.resolve().then(function () {
      return _interopRequireWildcard(require('@/components/Login.vue'));
    });
  }
}, {
  path: '/register',
  name: 'Register',
  component: function component() {
    return Promise.resolve().then(function () {
      return _interopRequireWildcard(require('@/components/Register.vue'));
    });
  }
}, {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: function component() {
    return Promise.resolve().then(function () {
      return _interopRequireWildcard(require('@/components/NotFound.vue'));
    });
  }
}];
var router = (0, _vueRouter.createRouter)({
  history: (0, _vueRouter.createWebHistory)(),
  routes: routes
});
router.afterEach(function (to) {
  var titles = {
    EditProfile: '编辑资料',
    Chat: '聊天',
    Friends: '好友',
    AI: 'AI助手',
    ChatWindow: '聊天',
    Login: '登录',
    Register: '注册',
    NotFound: '页面未找到'
  };
  document.title = titles[to.name] || '聊天系统';
});
var _default = router;
exports["default"] = _default;
//# sourceMappingURL=index.dev.js.map
