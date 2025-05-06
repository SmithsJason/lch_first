"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Login = void 0;

var _http = _interopRequireDefault(require("./http"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Login = function Login() {
  return (0, _http["default"])({
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    url: "api/login"
  });
};

exports.Login = Login;
//# sourceMappingURL=LoginApi.dev.js.map
