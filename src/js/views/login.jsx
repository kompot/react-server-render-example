/** @jsx React.DOM */

var React = require("react");
var PropTypes = React.PropTypes;
var dispatch = require("../dispatch");
var Forms = require("./forms/index.jsx");
var Fluxxor = require("fluxxor");

var Login = React.createClass({
  mixins: [Fluxxor.FluxChildMixin(React), Fluxxor.StoreWatchMixin("UserStore")],
  propTypes: {
    session: PropTypes.string
  },
  getStateFromFlux: function() {
    return this.getFlux().store("UserStore").getState();
  },
  handleSubmit: function () {
    this.getFlux().actions.loginUser({
      login: this.refs.userName.state.value,
      password: this.refs.password.state.value
    });
  },
  render: function() {
    var form = (
      <div className="form">
        <Forms.Text     label="User name" name="userName" placeholder="логин" ref="userName" />
        <Forms.Password label="Password"  name="password" placeholder="пароль" ref="password" />
        <Forms.Button   label="Log in" onClick={this.handleSubmit} />
      </div>
    );
    var noForm = (
      <div>
        Logged in as {this.state.userName} or session is {this.props.session}
      </div>
    );
    return this.state.loggedIn || this.props.session ? noForm : form;
  }
});

module.exports = Login;
