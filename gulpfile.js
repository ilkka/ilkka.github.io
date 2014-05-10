var gulp = require('gulp');
var browserify = require('gulp-browserify');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var livereload = require('gulp-livereload');
var uglify = require('gulp-uglify');
var cdn = require('gulp-google-cdn');

gulp.task('bundle', function() {
    return gulp.src('js/app.js')
        .pipe(plumber())
        .pipe(browserify({
            debug: true,
            transform: ['reactify']
        }))
        // .pipe(uglify())
        .pipe(rename('bundle.js'))
        .pipe(gulp.dest('static'))
        .pipe(livereload());
});

gulp.task('cdn', function() {
    return gulp.src('index.html')
        .pipe(cdn(require('./bower.json'), { cdn: require('google-cdn-data') }))
        .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('js/**/*.js', ['bundle']);
});


//default task
gulp.task('default', ['bundle', 'watch']);
