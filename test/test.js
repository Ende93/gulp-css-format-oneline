var gulp = require('gulp');
var cssformatOneline = require('../index.js');

gulp.src('unformat/*')   
    .pipe(cssformatOneline())
    .pipe( gulp.dest('formated') );
