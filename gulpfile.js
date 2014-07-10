'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: 'gulp{-,.}*',
  replaceString: /gulp(\-|\.)/
});
var runSequence = require('run-sequence');
var nib = require('nib');
var stylusConfig = { use: [nib()] };

var srcPath       = './src';
var dstProdPath   = './prod';
var dstDevPath    = './dev';


