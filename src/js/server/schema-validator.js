var tv4 = require("tv4");
var _ = require("lodash");

module.exports = {
  validate: function (req, res, schema) {
    var result = tv4.validateMultiple(req.body, schema);
    if (!result.valid) {
      res.send(400, _.map(result.errors, function (error) {
        return error.message;
      }));
      res.end();
    }
    return result.valid;
  }
};
