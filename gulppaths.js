var srcPath       = './src';
var dstProdPath   = './prod';
var dstDevPath    = './dev';
var dstHashPath   = '-hashed';
var client        = '/client';
var server        = '/server';

module.exports = {
  serverEntry:   '/server.js',
  webpackPrefix: 'bundle',
  client:        client,
  server:        server,
  src: {
//    css:         srcPath + '/styles',
//    cssWatch:    srcPath + '/styles/**/*',
    cssCompile: [srcPath + '/styles/app.styl',
           '!' + srcPath + '/styles/_*.styl'],
    js:          srcPath + '/js',
    jsWatch:     [srcPath + '/js/**/*.js', srcPath + '/js/**/*.jsx'],
    jsServer:    srcPath + '/js/server/**/*'
  },
  dst: {
    development: {
      root:       dstDevPath,
      rootClient: dstDevPath + client,
      rootServer: dstDevPath + server,
      js:         dstDevPath + client + '/js',
      jsServer:   dstDevPath + server + '/js'
    },
    production: {
      root:       dstProdPath,
      rootClient: dstProdPath + client,
      rootServer: dstProdPath + server,
      js:         dstProdPath + client + '/js',
      jsServer:   dstProdPath + server + '/js'
    },
    productionHashed: {
      root:       dstProdPath + dstHashPath,
      rootClient: dstProdPath + dstHashPath + client,
      rootServer: dstProdPath + dstHashPath + server,
      js:         dstProdPath + dstHashPath + client + '/js',
      jsServer:   dstProdPath + dstHashPath + server + '/js'
    }
  },
  tst: {
    root:         ['./test/*.js', './test/*.coffee']
  }
};
