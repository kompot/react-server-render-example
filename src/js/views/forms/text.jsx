/** @jsx React.DOM */

var React = require("react");
var PropTypes = React.PropTypes;

var Input = React.createClass({
  propTypes: {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string
  },
  getInitialState: function() {
    return {value: ''};
  },
  handleChange: function(event) {
    this.setState({value: event.target.value});
  },
  render: function() {
    return (
      <div className="form__text">
        <div className="form__text-label">
          {this.props.label}
        </div>
        <div className="form__text-control">
          <input type="text" name={this.props.name} placeholder={this.props.placeholder}
              value={this.state.value} onChange={this.handleChange} />
        </div>
      </div>
    )
  }
});

module.exports = Input;
