/** @jsx React.DOM */

var React = require("react");
var PopupBase = require("js/components/popup-base.jsx");
var dispatch = require("js/dispatch");
var logging = require("js/utils/logging");

var NetworkErrorPopup = React.createClass({
  render: function() {
    return (
      <PopupBase>
        <div id="network-error">network error, reload page</div>
      </PopupBase>
    );
  }
});

module.exports = function() {
  logging.warn("show network error popup");
  dispatch.emit("showPopup", NetworkErrorPopup());
};
