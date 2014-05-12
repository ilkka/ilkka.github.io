var gulp = require('gulp');
var browserify = require('gulp-browserify');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var livereload = require('gulp-livereload');
var uglify = require('gulp-uglify');
var cdn = require('gulp-google-cdn');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var concatCss = require('gulp-concat-css');
var brfs = require('brfs');

var styles = 'scss/*.scss';
var sources = 'js/**/*.js';

gulp.task('bundle', function() {
    return gulp.src('js/app.js')
        .pipe(plumber())
        .pipe(browserify({
            debug: true,
            transform: ['reactify', 'brfs']
        }))
        //.pipe(uglify())
        .pipe(rename('bundle.js'))
        .pipe(gulp.dest('static'))
        .pipe(livereload());
});

gulp.task('sass', function() {
    gulp.src(styles)
        .pipe(sass())
        .pipe(concatCss('css/bundle.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('.'));
});

gulp.task('cdn', function() {
    return gulp.src('index.html')
        .pipe(cdn(require('./bower.json'), { cdn: require('cdnjs-cdn-data') }))
        .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch([sources, styles], ['bundle', 'sass']);
});

//default task
gulp.task('default', ['bundle', 'sass', 'watch']);
