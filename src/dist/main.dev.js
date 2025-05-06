"use strict";

var _vue = require("vue");

var _App = _interopRequireDefault(require("./App.vue"));

var _router = _interopRequireDefault(require("./router"));

var _elementPlus = _interopRequireDefault(require("element-plus"));

require("element-plus/dist/index.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _vue.createApp)(_App["default"]);
app.use(_router["default"]);
app.use(_elementPlus["default"]);
app.mount('#app');
//# sourceMappingURL=main.dev.js.map
