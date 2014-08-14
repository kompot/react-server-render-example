/** @jsx React.DOM */

require("styles/app.styl");

var React = require("react");
var ReactMount = require("react/lib/ReactMount");
ReactMount.allowFullPageRender = true;

var isMobile = require("js/utils/mobile.js");
if (isMobile()) {
  React.initializeTouchEvents(true);
}

var logging = require("js/utils/logging");
logging.info("app starting");

var App = require("js/views/app.jsx");
var routes = require("js/routes");
var app = React.renderComponent(App(window.appProps), document);
routes.attach(app);
