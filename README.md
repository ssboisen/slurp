# slurp [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url]
> The streaming build system that pipes through a straw!

## Sample `slurpfile.js`

This file is just a quick sample to give you a taste of what slurp does.

```js
var slurp = require('slurpjs');
var gulp = require('gulp');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');

var paths = { 
	scripts: ['client/js/**/*.coffee', '!client/external/**/*.coffee'], 
	images: 'client/img/**/*'
};
```

## Want to contribute?

Anyone can help make this project better - check out the [Contributing guide](/CONTRIBUTING.md)!

[downloads-image]: http://img.shields.io/npm/dm/slurp.svg
[npm-url]: https://npmjs.org/package/slurp
[npm-image]: http://img.shields.io/npm/v/slurp.svg

[travis-url]: https://travis-ci.org/ssboisen/slurp
[travis-image]: http://img.shields.io/travis/ssboisen/slurp.svg

[coveralls-url]: https://coveralls.io/r/ssboisen/slurp
[coveralls-image]: http://img.shields.io/coveralls/ssboisen/slurp/master.svg
