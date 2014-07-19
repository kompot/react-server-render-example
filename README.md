# react client / server rendering example

this app demonstrates [react](http://facebook.github.io/react/) ability to share same codebase between client and server

## usage

* `npm install`
* `gulp` to develop
* `gulp build` to build production ready distribution
* `gulp test` to run tests in development environment
* `gulp pagespeed` to run pagespeed in production environment
* `gulp run` to run production version

You can change default environment (development or production) by modifying `implicitEnvsByTask` variable in `gulpfile.js`.

Tasks (`gulp -T` to list) with `:` in the name are not meant to be run externally.

    
