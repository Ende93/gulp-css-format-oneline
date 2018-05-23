# gulp-css-format-oneline
gulp plugin for format multi lines css rule to oneline.

this can use for html\ejs files which has style tag, to compress style to oneline, also can use for .css file.

see examples for more info:

## install 
1. `npm install gulp`;
2. `npm install gulp-css-format-oneline`;

## config(default)
```js
const gulp = require('gulp')
const compressCss = require('gulp-css-format-oneline')
gulp.src('style.css')
  .pipe(compressCss({
    // is keep line end for each rule
    // see example
    clearLine: true,
    // is clear comment
    clearComment: true,
    // is merge multi `style` tags to one
    // for not .css files
    merge: false,
    // only string type
    // for other file ext which the plugin not include
    // default support .htm, .html, .ejs, .ftl, .css
    ext: null
  }))
  .pipe(gulp.dest(...))
```
## example
### default 
#### gulpfile
```js
const gulp = require('gulp')
const compressCss = require('gulp-css-format-oneline')
gulp.src('style.css')
  .pipe(compressCss())
  .pipe(gulp.dest(...))
```
#### origin style.css
```css
/***
comment
***/
.a {
  display: block;
}

.b {
  display: block;
}
```

#### result
```css
.a{display: block;}.b{display: block;}
```
### one rule one line
#### gulpfile
```js
const gulp = require('gulp')
const compressCss = require('gulp-css-format-oneline')
gulp.src('style.css')
  .pipe(compressCss({
    clearLine: false
  }))
  .pipe(gulp.dest(...))
```
#### origin style.css
```css
/***
comment
***/
.a {
  display: block;
}

.b {
  display: block;
}
```
#### result
```css
.a {display: block;}
.b {display: block;}
```

### merge two or more tags to one
#### gulpfile
```js
const gulp = require('gulp')
const compressCss = require('gulp-css-format-oneline')
gulp.src('style.css')
  .pipe(compressCss({
    merge: true
  }))
  .pipe(gulp.dest(...))
```

#### origin test.html
```html
<style>
/***
comment
***/
.a {
  display: block;
}

.b {
  display: block;
}
</style>

<style>
.c {
  display: block;
}
</style>
```
#### result
```html
<style>
.a{display:block;}.b{display:block;}.c{display:block;}
</style>
```

## test
run:
```shell
npm i jest -g
jest
```