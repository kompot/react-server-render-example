var express = require("express");
var React = require("react");
var fs = require("fs");
var path = require("path");
var morgan = require("morgan");
var compression = require("compression");
var schemaValidator = require('./schema-validator');

require("node-jsx").install({extension: ".jsx", harmony: true});

var app = express();
var ReactApp = require("../views/app.jsx");
var ReactRouter = require("../routes");
var Const = require("../const");

app.use(compression());
console.log('process.env.NODE_STATIC_DIR ', process.env.NODE_STATIC_DIR);
var staticFolder = process.env.NODE_STATIC_DIR || (path.join(process.cwd(), require('../../../gulppaths').dst.development.root, require('../../../gulppaths').client));
console.log('staticFolder ', staticFolder);
app.use(express.static(staticFolder));
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan("short"));

app.get("/riak/*", function(req, res, next) {
  if (req.path === "/riak/test/grid") {
    res.send({
      items: [{
        id: 1,
        title: "Форс-Мажоры",
        image: "http://st7.imhonet.ru/element/7e/b2/7eb2a71bfa6e8a266877ae228325e4d2.jpg"
      }, {
        id: 2,
        title: "Пепел",
        image: "http://st8.imhonet.ru/element/85/d1/85d13f58cee1078c90bf8b4bb2568daa.jpg"
      }, {
        id: 3,
        title: "Mass Effect 3",
        image: "http://stb.imhonet.ru/element/b4/86/b486187cfcc9b1b2df8d4e935077e8e4.jpg"
      }]
    });
  } else if (req.path === "/riak/test/element-1") {
    res.send({
      id: 1,
      title: "Форс-Мажоры",
      image: "http://st7.imhonet.ru/element/7e/b2/7eb2a71bfa6e8a266877ae228325e4d2.jpg" ,
      desc: "Популярный американский сериал «Форс-мажоры» (Suits) вышел в прокат в 2011 году. Его драматический сюжет рассказывает историю юриста-самоучки Майка Росса, который выдавал себя за выпускника Гарварда. Его нанимают к одному из лучших адвокатов Нью-Йорка."
    });
  } else if (req.path === "/riak/test/element-2") {
    res.send({
      id: 2,
      title: "Пепел",
      image: "http://st8.imhonet.ru/element/85/d1/85d13f58cee1078c90bf8b4bb2568daa.jpg",
      desc: "«Пепел» – телевизионный многосерийный фильм Вадима Перельмана («Дом из песка и тумана»), события которого разворачиваются в период с 1938 по 1948 годы."
    });
  } else if (req.path === "/riak/test/element-3") {
    res.send({
      id: 3,
      title: "Mass Effect 3",
      image: "http://stb.imhonet.ru/element/b4/86/b486187cfcc9b1b2df8d4e935077e8e4.jpg",
      desc: "Игра Mass Effect 3 — это третья часть культовой серии научно-фантастических RPG от канадской компании BioWare."
    });
  } else {
    res.writeHead(404, {});
    res.end("404");
  }
});

app.post('/api/auth', function(req, res) {
  if (schemaValidator.validate(req, res, require('../../json-schema/auth-user.json'))) {
    console.log('req.body', req.body);
    if (req.body) {
      console.log('login    ' + req.body.login);
      console.log('password ' + req.body.password);
    }
    res.cookie("session", "session-" + req.body.login);
    res.send({
      "success": true,
      "data": {
        "session-id": "session-" + req.body.login
      }
    });
  }
});

app.delete('/api/auth', function(req, res) {
  res.clearCookie('session');
  res.send({
    "success": true,
    "message": "Cookie deleted."
  })
});

var devServerHost = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';

app.get("/*", function(req, res, next) {
  ReactRouter.getProps(req.path).then(function(data) {
    var component = ReactApp({
      path: req.path,
      cssPath: '/js/entry.css',
      entryBundlePath: devServerHost + "/js/entry.bundle.js",
      commonBundlePath: devServerHost + "/js/common.bundle.js",
      pageType: data.pageType,
      pageData: data.pageData,
      locked: false,
      session: req.cookies && req.cookies.session
    });
    var html = "<!doctype html>\n" + React.renderComponentToString(component);
    var statusCode = data.pageType === Const.NOT_FOUND ? 404 : 200;
    res.writeHead(statusCode, {
      "Content-Type": "text/html"
    });
    res.end(html);
  }, next).catch(next);
});

var port = parseInt(process.env.PORT || 8080);
app.listen(port, function() {
  console.log("serving on port " + port);
});

if (devServerHost) {
  var webpack = require('webpack');
  var WebpackDevServer = require('webpack-dev-server');
  var config = require('../../../webpack.config');

  app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', devServerHost);
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
  });

  new WebpackDevServer(webpack(config), {
    publicPath: devServerHost + '/js/',
    contentBase: 'http://localhost:8080',
    hot: true,
    stats: {
      colors: true,
      assets: true,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false, // set to true to get debug info on each file
      children: false
    }
  }).listen(3000, 'localhost', function (err, result) {
    if (err) {
      console.log(err);
    }
    console.log('Webpack listening at localhost:3000');
  });
}
