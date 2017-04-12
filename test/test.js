var gulp = require('gulp');
var cssformatOneline = require('../index.js');

gulp.src('a.css')   
    .pipe(cssformatOneline())
    .pipe( gulp.dest('new') );
