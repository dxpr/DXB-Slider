const gulp = require('gulp');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');

// Minify JavaScript
gulp.task('minify-js', function() {
  return gulp.src('dxb-slider.js')
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('.'));
});

// Minify CSS
gulp.task('minify-css', function() {
  return gulp.src('dxb-slider.css')
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('.'));
});

// Default task
gulp.task('default', gulp.parallel('minify-js', 'minify-css'));