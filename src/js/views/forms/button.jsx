/** @jsx React.DOM */

var React = require("react");
var PropTypes = React.PropTypes;

var Input = React.createClass({
  propTypes: {
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func
  },
  handleClick: function () {
    this.props.onClick();
  },
  render: function() {
    return (
      <div className="form__button">
        <div className="form__button-control">
          <button onClick={this.handleClick}>
            {this.props.label}
          </button>
        </div>
      </div>
    )
  }
});

module.exports = Input;
