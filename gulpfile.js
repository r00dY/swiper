var gulp = require('gulp');
var webpack = require('webpack-stream');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

var SASS_FILES = ['./*.scss', './demo/**/*.scss'];
var JS_FILES = ['./*.js', './demo/**/*.js'];

gulp.task('webpack', function() {
  return gulp.src('./demo/scripts.js')
    .pipe(webpack({
      output: {
        filename: 'bundle.js',
      }
    }))
    .pipe(gulp.dest('./demo/dist/'));
});

gulp.task('swiper', function() {
    return gulp.src('./new_swiper/scripts.js')
        .pipe(webpack({
            output: {
                filename: 'bundle.js',
            }
        }))
        .pipe(gulp.dest('./new_swiper/'));
});


gulp.task('sass', [], function() {
    return gulp.src('./demo/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./demo/dist/'))
});


gulp.task('run', ['webpack', 'sass'], function() {

  browserSync.init({
      server: {
          baseDir: "./demo/"
      },
      ghostMode: {
          clicks: true,
          forms: true,
          scroll: false
      }
  });

  gulp.watch(SASS_FILES, ['sass']);
  gulp.watch(JS_FILES, ['webpack']).on('change', browserSync.reload);

});

gulp.task('default', ['run']);

