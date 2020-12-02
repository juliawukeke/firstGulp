/*****************************************************
 * Import
 *****************************************************/
// Public
import gulp from 'gulp'
import sourcemaps from 'gulp-sourcemaps'
import del from 'del'
import gulpIf from 'gulp-if'
import browserSync from 'browser-sync'
import plumber from 'gulp-plumber'
import watch from 'gulp-watch'
import rename from 'gulp-rename'
import ignore from 'gulp-ignore'

// Html / Pug
import pug from 'gulp-pug'
// Scss / Css
import sass from 'gulp-sass'
import postcss from 'gulp-postcss'
import autoprefixer from 'autoprefixer'
import cleancss from 'gulp-clean-css'
sass.compiler = require('node-sass');
// Script
import babel from 'gulp-babel'
import uglify from 'gulp-uglify'
// Image
import imagemin from 'gulp-imagemin'

/*****************************************************
 * Functions
 *****************************************************/
// Public
const isBuildTask = process.argv[2] === 'build'
const otherDoc = [
    './src/**/*',
    '!./src/_layouts',
    '!./src/_partials',
    '!./src/content/css/_mixins',
    '!./src/content/css/_variables',
    '!./src/content/vendor/',
    '!./src/content/vendor/**/*',
    '!./src/**/*.{html,pug,css,scss,js,png,jpg,jpeg,gif}',
    '!./src/**/.git*'
];

// Clean
export function clean() {
    return del('./dist/**')
}

// Browser
export function browser() {
    browserSync.init({
        server: {
            baseDir: './dist'
        }
    })
    watch('./src/**/*.html', html);
    watch('./src/**/*.pug', pughtml);
    watch('./src/**/*.css', css);
    watch(['./src/**/*.sass', './src/**/*.scss'], scss);
    watch('./src/**/*.js', script);
    watch('./src/**/*.{png,jpg,jpeg,gif}', image);
    watch(otherDoc, other);
}

// Html / Pug
export function html() {
    return gulp
        .src('./src/**/*.html')
        .pipe(plumber())
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream())
}
export function pughtml() {
    return gulp
        .src('./src/**/*.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: true,
        }))
        .pipe(ignore.exclude('_**/*.html'))
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream())
}
// Css / Scss
export function css() {
    const processors = [
        autoprefixer(),
    ];
    return gulp
        .src('./src/**/*.css')
        .pipe(plumber())
        .pipe(gulpIf(isBuildTask, sourcemaps.init()))
        .pipe(postcss(processors))
        .pipe(gulp.dest('./dist'))
        .pipe(gulpIf(isBuildTask, cleancss()))
        .pipe(rename(function(path) {
            path.basename += '.min';
            path.extname = '.css';
        }))
        .pipe(gulpIf(isBuildTask, sourcemaps.write('.')))
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream())
}
export function scss() {
    const processors = [
        autoprefixer(),
    ];
    return gulp
        .src(['./src/**/*.sass', './src/**/*.scss'])
        .pipe(plumber())
        .pipe(gulpIf(isBuildTask, sourcemaps.init()))
        .pipe(
            sass({
                outputStyle: 'expanded' //Values: nested, expanded, compact, compressed
            }).on('error', sass.logError)
        )
        .pipe(postcss(processors))
        .pipe(gulp.dest('./dist'))
        .pipe(gulpIf(isBuildTask, cleancss()))
        .pipe(rename(function(path) {
            path.basename += '.min';
            path.extname = '.css';
        }))
        .pipe(gulpIf(isBuildTask, sourcemaps.write('.')))
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream())
}
// script
export function script() {
    return gulp
        .src('./src/**/*.js')
        .pipe(plumber())
        .pipe(gulpIf(isBuildTask, sourcemaps.init()))
        .pipe(
            babel({
                presets: ['@babel/env']
            })
        )
        .pipe(gulp.dest('./dist'))
        .pipe(gulpIf(isBuildTask, uglify()))
        .pipe(rename(function(path) {
            path.basename += '.min';
            path.extname = '.js';
        }))
        .pipe(gulpIf(isBuildTask, sourcemaps.write('.')))
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream())
}
// Image
export function image() {
    return gulp
        .src('./src/**/*.{png,jpg,jpeg,gif}')
        .pipe(plumber())
        .pipe(gulpIf(isBuildTask, imagemin()))
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream())
}
// Other
export function other() {
    return gulp
        .src(otherDoc)
        .pipe(plumber())
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.stream());
}

exports.default = exports.build = gulp.series(
    clean,
    gulp.parallel(
        html,
        pughtml,
        css,
        scss,
        script,
        other,
        image
    ),
    browser
);