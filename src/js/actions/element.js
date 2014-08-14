var baseAction = require("js/actions/base");
var remote = require("js/utils/remote");
var Const = require("js/const");

module.exports = baseAction(Const.ELEMENT, true, function(resolve, reject, pathData) {
  remote.get("/riak/test/element-" + pathData.id).then(resolve, reject);
});
