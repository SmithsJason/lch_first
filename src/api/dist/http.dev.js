"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _elementPlus = require("element-plus");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var http = _axios["default"].create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    "Content-Type": "application/json;charset=utf-8"
  }
});

http.interceptors.request.use(function (config) {
  if (useUserStore().token) {
    config.headers['authorization'] = "".concat(useUserStore().token);
  }

  return config;
}, function (error) {
  return Promise.reject(error);
});
http.interceptors.response.use(function (response) {
  return response.data;
}, function (error) {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        break;

      default:
        _elementPlus.ElMessage.error(error.response.data.message || '服务器错误');

    }
  }

  return Promise.reject(error);
});
var _default = http;
exports["default"] = _default;
//# sourceMappingURL=http.dev.js.map
