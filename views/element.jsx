/** @jsx React.DOM */

var React = require("react");
var dispatch = require("../dispatch");
var Popup = require("./popup");

var Element = React.createClass({
  propTypes: {
    data: React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      title: React.PropTypes.string.isRequired,
      image: React.PropTypes.string.isRequired,
      desc: React.PropTypes.string.isRequired
    }).isRequired
  },
  getDefaultProps: function() {
    return {
      data: {
        id: 0,
        title: "fake",
        image: "about://blank"
      }
    };
  },
  titleClickHandler: function() {
    dispatch.emit("showPopup", Popup());
  },
  render: function() {
    return (
      <div className="element">
        <h1 onClick={this.titleClickHandler}>{this.props.data.title}</h1>
        <img src={this.props.data.image} />
        <div className="elementDescription">{this.props.data.desc}</div>
      </div>
    );
  }
});

module.exports = Element;
