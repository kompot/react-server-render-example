var penthouse = require('penthouse');
var fs = require("fs");
var path = require("path");
var Promise = require("bluebird");
Promise.promisifyAll(fs);

var staticFolder = process.env.NODE_STATIC_DIR;

module.exports = {

  generateCriticalCss: function (p) {
    // penthouse does not seem to be promisifiable
    penthouse({
      url: 'http://localhost:8080' + p,
      css: path.join(staticFolder, '/js/entry.css'),
      width: 1920,
      height: 1080
    }, function(err, criticalCss) {
      if (err) {
        throw err;
      }
      fs.mkdirAsync(
        path.join(staticFolder, 'critical', p)
      ).then(
        fs.writeFileAsync(path.join(staticFolder, 'critical', p, 'index.css'), criticalCss)
      ).catch(function (e) {
        console.error("Unable to extract critical path css", e);
      });
    })
  },

  getCriticalCssPath: function (p) {
    return fs.readFileAsync(path.join(staticFolder, 'critical', p, 'index.css')).then(function (data) {
      return data.toString('utf8');
    }).catch(function(e) {
      return null;
    });
  },

  isPenthouse: function (req) {
    return req.headers['user-agent'].toLowerCase().indexOf('penthouse') !== -1;
  }

};
