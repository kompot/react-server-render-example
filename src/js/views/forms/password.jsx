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
      <div className="form__password">
        <div className="form__password-label">
          {this.props.label}
        </div>
        <div className="form__password-control">
          <input type="password" name={this.props.name} placeholder={this.props.placeholder}
              value={this.state.value} onChange={this.handleChange} />
        </div>
      </div>
    )
  }
});

module.exports = Input;
