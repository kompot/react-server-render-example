/** @jsx React.DOM */

var React = require("react");
var Const = require("js/const");
var Grid = require("js/views/grid.jsx");
var Element = require("js/views/element.jsx");
var Preloader = require("js/components/preloader.jsx");
var NotFound = require("js/views/not-found.jsx");
var dispatch = require("js/dispatch");
var Login = require("js/views/login.jsx");

var PropTypes = React.PropTypes;

var Counter = React.createClass({

  getInitialState: function() {
    return {
      value: 1
    };
  },

  toggle: function() {
    this.setState({
      value: this.state.value + 1
    });
  },

  render: function() {
    return (
      <span style={{marginLeft: 20, cursor: "pointer"}}
            onClick={this.toggle}>
        {this.state.value}
      </span>
    );
  }

});

var Fluxxor = require("fluxxor");
// gulp-rev-all seems to dislike this particular link all of a sudden
var flux = new Fluxxor.Flux(require('../flux/stores.js'), require('../flux/actions'));

var FluxMixin = Fluxxor.FluxMixin(React);
var FluxChildMixin = Fluxxor.FluxChildMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var CurrentUser = React.createClass({
  mixins: [FluxChildMixin, StoreWatchMixin("UserStore")],
  getStateFromFlux: function() {
    return flux.store("UserStore").getState();
  },
  render: function() {
    if (this.state.loggedIn) {
      return (
        <span style={{marginLeft: "20px"}}>
          Current user {this.state.userName}
        </span>
      );
    } else {
      return null;
    }
  }

});

var App = React.createClass({
  mixins: [FluxMixin],

  propTypes: {
    path: PropTypes.string.isRequired,
    cssPath: PropTypes.string.isRequired,
    cssInline: PropTypes.string,
    entryBundlePath: PropTypes.string.isRequired,
    commonBundlePath: PropTypes.string.isRequired,
    pageType: PropTypes.string.isRequired,
    pageData: PropTypes.object.isRequired,
    locked: PropTypes.bool.isRequired,
    session: PropTypes.string
  },

  getDefaultProps: function () {
    return {
      flux: flux
    }
  },

  getInitialState: function() {
    return {
      activePopup: null
    };
  },

  showPopup: function(popup) {
    this.setState({
      activePopup: popup
    });
  },

  hidePopup: function() {
    this.setState({
      activePopup: null
    });
  },

  componentWillMount: function() {
    dispatch.on("showPopup", this.showPopup);
    dispatch.on("hidePopup", this.hidePopup);
    dispatch.on("navigate", this.hidePopup);
  },

  render: function() {

    var injectConfig = "window.appProps=" + JSON.stringify({
      path: this.props.path,
      cssPath: this.props.cssPath,
      entryBundlePath: this.props.entryBundlePath,
      commonBundlePath: this.props.commonBundlePath,
      pageType: this.props.pageType,
      pageData: this.props.pageData,
      locked: this.props.locked
    }) + ";";

    var Page;
    switch (this.props.pageType) {
      case Const.GRID:
        Page = Grid;
        break;
      case Const.ELEMENT:
        Page = Element;
        break;
      default:
        Page = NotFound;
    }

    var lock = null;
    if (this.props.locked) {
      lock = (
        <div id="locked-app">
          <Preloader />
        </div>
      );
    }
    var inlineCss = null;
    if (this.props.cssInline) {
      inlineCss = (
        <style type="text/css" dangerouslySetInnerHTML={{__html: this.props.cssInline}} />
      )
    } else {
      inlineCss = (
          <link href={this.props.cssPath} rel="stylesheet" type="text/css" />
      )
    }

    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>node render</title>
          <link href="http://fonts.googleapis.com/css?family=Open+Sans:400&subset=latin,cyrillic" rel="stylesheet" type="text/css" />
          {inlineCss}
        </head>
        <body>
          <header>
            <div className="project-title">
              react server render demo
              <Counter />
              <CurrentUser />
            </div>
            <div className="login">
              <Login session={this.props.session} />
            </div>
          </header>
          <section id="workspace">
            {Page(this.props.pageData)}
          </section>
          <footer></footer>
          {this.state.activePopup ? this.state.activePopup : null}
          {lock}
          <script src={this.props.commonBundlePath} />
          <script dangerouslySetInnerHTML={{__html: injectConfig}} />
          <script src={this.props.entryBundlePath} />
        </body>
      </html>
    );
  }

});

module.exports = App;
