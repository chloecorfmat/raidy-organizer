const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const sassLint = require('gulp-sass-lint');
const esLint = require('gulp-eslint');
const cleanCSS = require('gulp-clean-css');

// Linter.
gulp.task('lint', function() {
    gulp.src('./js/**/*.js')
        .pipe(esLint())
        .pipe(esLint.format())
        //.pipe(esLint.failAfterError());

    gulp.src('./scss/**/*.scss')
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
    return null;
});

gulp.task('styles', function() {
    // place code for your default task here
    return gulp.src('./scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false,
        }))
        .pipe(gulp.dest('./css'))
        .pipe(rename('../dist/css/styles.css'))
        .pipe(gulp.dest('./css'))
        // Comment the line below to have unminify files.
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename('css/styles.min.css'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('scripts', function() {
    return gulp.src('./js/**/*.js')
        .pipe(concat('../dist/js/scripts.js'))
        .pipe(gulp.dest('./js'))
        // Comment the line below to have unminify files.
        //.pipe(uglify())
        .pipe(rename('js/scripts.min.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['lint', 'styles', 'scripts'], function() {
    // place code for your default task here
    return null;
});

gulp.task('watch', function () {
    gulp.watch(['./scss/**/*.scss', './js/**/*.js'], ['lint']);
    gulp.watch('./scss/**/*.scss', ['styles']);
    gulp.watch('./js/**/*.js', ['scripts']);
});