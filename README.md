# gulp-css-format-oneline
gulp plugin for format multi lines css rule to oneline.

this can use for html\ejs that has style tag or just for css file
# example
## origin
```
.a {
  display: block;
}

.b {
  display: block;
}
```

## result
```
.a {display: block;}
.b {display: block;}
```

# useage
1.`npm install gulp`;
 
2.`npm install gulp-css-format-oneline`;
 
3.use this plugin like other plugin:
```
var gulp = require('gulp');
var cssOnelineFormat = require('gulp-css-format-oneline');

gulp.src('src')
  .pipe( cssOnelineFormat() )
  .pipe( gulp.dest() );
```
