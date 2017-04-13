var gulp = require('gulp');
var cssformatOneline = require('../index.js');

gulp.src('unformat/a.css')   
    .pipe(cssformatOneline())
    .pipe( gulp.dest('formated') );
