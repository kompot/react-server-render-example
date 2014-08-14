var baseAction = require("js/actions/base");
var Const = require("js/const");

module.exports = baseAction(Const.NOT_FOUND, true, function(resolve) {
  resolve();
});
