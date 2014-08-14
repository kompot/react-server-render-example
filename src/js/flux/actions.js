var constants = require('js/flux/constants');

module.exports = {
  loginUser: function (payload) {
    this.dispatch(constants.LOGIN_USER, payload);
  }
};
