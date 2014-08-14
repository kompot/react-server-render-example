var baseAction = require("js/actions/base");
var remote = require("js/utils/remote");
var Const = require("js/const");

module.exports = baseAction(Const.GRID, true, function(resolve, reject) {
  remote.get("/riak/test/grid").then(resolve, reject);
});
