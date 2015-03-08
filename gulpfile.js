var gulp = require('gulp');
var server = require('gulp-express');
var concat = require('gulp-concat');
var lib    = require('bower-files')();


gulp.task("scripts", function(){

  // Cobmine the other scripts
  gulp.src(['./public/scripts/main.js', './public/scripts/map.js', './public/scripts/geosearch/src/js/l.control.geosearch.js', './public/scripts/geosearch/src/js/l.geosearch.provider.google.js'])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./public/dist/'));

  gulp.src(lib.ext('js').files)
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('./public/dist/'));

  /* Combine the bower dependencies
  gulpBowerFiles()
  .pipe(concat('bundle.js'))
  .pipe(gulp.dest('./public/dist/'));
  */


});

gulp.task("node", function(){
  server.run(['index.js']);
});

gulp.task('default', ['scripts', 'node']);
