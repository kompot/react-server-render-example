var Router = require("./router");
var router = new Router();
module.exports = router;

router.addRoute("grid", "/", require("./actions/grid"));
router.addRoute("element", "/element/(?<id>.+)", require("./actions/element"));

// TODO .js file extension required by this bug in gulp-rev-all
// https://github.com/smysnk/gulp-rev-all/issues/25
router.set404Route(require("./actions/not-found.js"));
router.setErrorHandler(require("./views/network-error.jsx"));
