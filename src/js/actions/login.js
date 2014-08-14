var baseAction = require("js/actions/base");
var remote = require("js/utils/remote");
var Const = require("js/const");
var dispatch = require("js/dispatch");

module.exports = function(data) {
  return baseAction(null, false, function(resolve, reject) {
    remote.post("/api/auth", data).then(resolve, reject);
  })();
};
