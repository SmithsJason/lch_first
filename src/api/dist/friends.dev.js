"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeFriend = exports.fetchFriends = exports.markAllRead = exports.handleFriendRequest = exports.sendFriendRequest = exports.searchUsers = exports.fetchNotifications = void 0;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var API_URL = 'http://localhost:8080/api';

var fetchNotifications = function fetchNotifications(account) {
  var response;
  return regeneratorRuntime.async(function fetchNotifications$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(_axios["default"].get("".concat(API_URL, "/notifications"), {
            params: {
              account: account
            }
          }));

        case 3:
          response = _context.sent;
          return _context.abrupt("return", response.data.map(function (notification) {
            var avatar = notification.senderAvatar || 'https://via.placeholder.com/40';
            return _objectSpread({}, notification, {
              isProcessing: false,
              senderAvatar: avatar
            });
          }));

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          console.error('获取通知错误:', _context.t0);
          throw new Error('获取通知失败');

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

exports.fetchNotifications = fetchNotifications;

var searchUsers = function searchUsers(query, currentAccount) {
  var response;
  return regeneratorRuntime.async(function searchUsers$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(_axios["default"].get("".concat(API_URL, "/users/search"), {
            params: {
              query: query,
              currentAccount: currentAccount
            }
          }));

        case 3:
          response = _context2.sent;
          return _context2.abrupt("return", response.data.map(function (user) {
            return _objectSpread({}, user, {
              message: '',
              isSending: false,
              avatar: user.avatar || 'https://via.placeholder.com/40'
            });
          }));

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          console.error('搜索用户错误:', _context2.t0);
          throw new Error('搜索用户失败');

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

exports.searchUsers = searchUsers;

var sendFriendRequest = function sendFriendRequest(senderAccount, receiverAccount, message) {
  var response;
  return regeneratorRuntime.async(function sendFriendRequest$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(_axios["default"].post("".concat(API_URL, "/friend-requests/send"), {
            senderAccount: senderAccount,
            receiverAccount: receiverAccount,
            message: message
          }));

        case 3:
          response = _context3.sent;
          return _context3.abrupt("return", response.data);

        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          console.error('发送好友请求错误:', _context3.t0);
          throw new Error('发送好友请求失败');

        case 11:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

exports.sendFriendRequest = sendFriendRequest;

var handleFriendRequest = function handleFriendRequest(requestId, action, account) {
  var response;
  return regeneratorRuntime.async(function handleFriendRequest$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          console.log("\u5904\u7406\u597D\u53CB\u8BF7\u6C42: ".concat(requestId, ", \u64CD\u4F5C: ").concat(action, ", \u8D26\u6237: ").concat(account));
          _context4.prev = 1;
          _context4.next = 4;
          return regeneratorRuntime.awrap(_axios["default"].post("".concat(API_URL, "/friend-requests/").concat(requestId, "/").concat(action), {
            account: account
          }));

        case 4:
          response = _context4.sent;
          console.log("".concat(action, "\u597D\u53CB\u8BF7\u6C42\u6210\u529F:"), response.data);
          return _context4.abrupt("return", response.data);

        case 9:
          _context4.prev = 9;
          _context4.t0 = _context4["catch"](1);
          console.error("".concat(action, "\u597D\u53CB\u8BF7\u6C42\u9519\u8BEF:"), _context4.t0);
          throw new Error("\u5904\u7406\u597D\u53CB\u8BF7\u6C42\u5931\u8D25");

        case 13:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 9]]);
};

exports.handleFriendRequest = handleFriendRequest;

var markAllRead = function markAllRead(account) {
  var response;
  return regeneratorRuntime.async(function markAllRead$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(_axios["default"].post("".concat(API_URL, "/notifications/mark-all-read"), {
            account: account
          }));

        case 3:
          response = _context5.sent;
          return _context5.abrupt("return", response.data);

        case 7:
          _context5.prev = 7;
          _context5.t0 = _context5["catch"](0);
          console.error('标记全部已读错误:', _context5.t0);
          throw new Error('标记已读失败');

        case 11:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

exports.markAllRead = markAllRead;

var fetchFriends = function fetchFriends(account) {
  var response;
  return regeneratorRuntime.async(function fetchFriends$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap(_axios["default"].get("".concat(API_URL, "/friends"), {
            params: {
              account: account
            }
          }));

        case 3:
          response = _context6.sent;
          return _context6.abrupt("return", response.data.map(function (friend) {
            return _objectSpread({}, friend, {
              isRemoving: false,
              avatar: friend.avatar || 'https://via.placeholder.com/40'
            });
          }));

        case 7:
          _context6.prev = 7;
          _context6.t0 = _context6["catch"](0);
          console.error('获取好友列表错误:', _context6.t0);
          throw new Error('获取好友列表失败');

        case 11:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

exports.fetchFriends = fetchFriends;

var removeFriend = function removeFriend(userAccount, friendAccount) {
  var response;
  return regeneratorRuntime.async(function removeFriend$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return regeneratorRuntime.awrap(_axios["default"]["delete"]("".concat(API_URL, "/friends/remove"), {
            params: {
              userAccount: userAccount,
              friendAccount: friendAccount
            }
          }));

        case 3:
          response = _context7.sent;
          return _context7.abrupt("return", response.data);

        case 7:
          _context7.prev = 7;
          _context7.t0 = _context7["catch"](0);
          console.error('删除好友错误:', _context7.t0);
          throw new Error('删除好友失败');

        case 11:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

exports.removeFriend = removeFriend;
//# sourceMappingURL=friends.dev.js.map
