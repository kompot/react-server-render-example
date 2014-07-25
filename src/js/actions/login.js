var baseAction = require("./base");
var remote = require("../utils/remote");
var Const = require("../const");
var dispatch = require("../dispatch");

module.exports = function(data) {
  return baseAction(null, false, function(resolve, reject) {
    remote.post("/api/auth", data).then(resolve, reject);
  })();
};
