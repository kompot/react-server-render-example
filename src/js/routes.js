var Router = require("js/router");
var router = new Router();
module.exports = router;

router.addRoute("grid", "/", require("./actions/grid"));
router.addRoute("element", "/element/(?<id>.+)", require("./actions/element"));

router.set404Route(require("js/actions/not-found"));
router.setErrorHandler(require("js/views/network-error.jsx"));
