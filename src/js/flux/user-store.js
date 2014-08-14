var Fluxxor = require("fluxxor");
var tv4 = require("tv4");
var loginAction = require('js/actions/login');
var constants = require('js/flux/constants');

var UserStore = Fluxxor.createStore({
  initialize: function() {
    this.loggedIn = false;
    this.userName = '';

    this.bindActions(
        constants.LOGIN_USER, this.loginUser
    );
  },

  loginUser: function(payload) {
    var result = tv4.validateMultiple(payload, require('json-schema/auth-user.json'));
    if (result.valid) {
      var self = this;
      loginAction(payload).then(function (data) {
        self.loggedIn = true;
        self.userName = payload.login;
        self.emit('change');
      }, function () {});
    }
  },

  getState: function() {
    return {
      userName: this.userName,
      loggedIn: this.loggedIn
    };
  }
});

module.exports = UserStore;
