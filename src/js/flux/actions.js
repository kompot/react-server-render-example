var constants = require('./constants');

module.exports = {
  loginUser: function (payload) {
    this.dispatch(constants.LOGIN_USER, payload);
  }
};
