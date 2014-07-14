var srcPath       = './src';
var dstProdPath   = './prod';
var dstDevPath    = './dev-gulp';
var dstHashPath   = '-hashed';
var client        = '/client';
var server        = '/server';

module.exports = {
  serverEntry:   '/server/server-gulp.js',
  webpackPrefix: 'bundle',
  client:        client,
  server:        server,
  src: {
    css:         srcPath + '/styles',
    cssWatch:    srcPath + '/styles/**/*',
    cssCompile: [srcPath + '/styles/app.styl',
           '!' + srcPath + '/styles/_*.styl'],
    js:          srcPath + '/js',
    jsWatch:     [srcPath + '/js/**/*', srcPath + '/js/**/*.jsx'],
    jsServer:    srcPath + '/js/server/**/*'
  },
  dst: {
    development: {
      root:       dstDevPath,
      css:        dstDevPath + client + '/css',
      js:         dstDevPath + client + '/js',
      jsServer:   dstDevPath + server + '/js'
    },
    production: {
      root:       dstProdPath,
      rootHashed: dstProdPath + dstHashPath,
      css:        dstProdPath + client + '/css',
      js:         dstProdPath + client + '/js',
      jsServer:   dstProdPath + server + '/js'
    }
  }
};
