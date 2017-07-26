'use strict';
/////////////////////////////////////////
// Add References
/////////////////////////////////////////

// Reference Gulp
var gulp = require('gulp');

// Utility plugins
var browserSync = require('browser-sync'),
    notify      = require('gulp-notify'),
    rename      = require('gulp-rename'),
    sourcemaps  = require('gulp-sourcemaps'),
    gutil       = require('gulp-util'),
    cp          = require('child_process'),
    del         = require('del');

// Jekyll
var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

// JavaScript Plugins
var uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

// SCSS Plugins
var sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cleancss = require('gulp-clean-css'),
    postcss = require('gulp-postcss');

// Image Plugins
var imagemin = require('gulp-imagemin');

/////////////////////////////////////////
// Directories Paths
/////////////////////////////////////////

// Source Directory
var srcDir = {
    scss: './_sass/**/*.scss',
    scripts: './_scripts/*.js',
    images: './_images/**/*.{png,gif,jpg,jpeg,svg}',
    fonts: './_fonts/*.{eot,svg,ttf,woff}',
    bower_components: './bower_components/**/*'
};

var sassPaths = [
  './bower_components/normalize.scss/sass',
  './bower_components/foundation-sites/scss',
  './bower_components/motion-ui/src'
];

// Output Directory
var outputDir = {
    base: './_site',
    baseCSS: './_site/css',
    baseJS: './_site/js',
    css: './css',
    js: './js'
};

/////////////////////////////////////////
//       Start Gulp Tasks
/////////////////////////////////////////

// Clean site directories
gulp.task('clean', function () {
    del.sync(['./_site/**']);
});
gulp.task('cleanStyles', function () {
    del.sync(['./_site/css/**', './css/**', './.sass-cache/**']);
});
gulp.task('cleanScripts', function () {
    del.sync(['./_site/js/**', './js/**']);
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('styles', function() {
  return gulp.src(srcDir.scss)
             .pipe(sass({
                    includePaths: sassPaths,
                    onError: browserSync.notify
             }))
             .pipe(autoprefixer({
                browsers: ['last 2 versions', 'ie >= 9']
             }))
             .pipe(gulp.dest(outputDir.baseCSS))
             .pipe(gulp.dest(outputDir.css))
             .pipe(sourcemaps.init())
             .pipe(cleancss())
             .pipe(sourcemaps.write())
             .pipe(rename({
                suffix: '.min'
             }))
             .pipe(gulp.dest(outputDir.baseCSS))
             .pipe(browserSync.reload({stream:true}))
             .pipe(gulp.dest(outputDir.css))
});

// Concatenate and Minify JavaScript 
gulp.task('scripts', function(){
  return gulp.src(srcDir.scripts)
    .pipe(concat('app.js'))
    .on('error', gutil.log)
    .pipe(gulp.dest(outputDir.baseJS))
    .pipe(gulp.dest(outputDir.js))
     //.pipe(rename({suffix: '.min'}))
    //.pipe(uglify())
    .on('error', gutil.log);
    //.pipe(gulp.dest(outputDir.base + '/scripts/'))
    //.pipe(notify({ message: 'Scripts include task complete' }));
});

// Optimize Images
/*gulp.task('images', function(){
  return gulp.src(srcDir.images)
    .pipe(imagemin({ 
      interlaced: true,
        optimizationLevel: 3,
        progressive: true,
        svgoPlugins: [{
            removeViewBox: false
          }, {
            collapseGroups: false
          }, {
            cleanupIDs: false
      }]
    }))
    .pipe(gulp.dest(outputDir + '/img/'))
    //.pipe(notify({ message: 'Images task complete' }));
});*/

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
             .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Launch the Server
 */
gulp.task('browser-sync', ['styles', 'scripts', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: outputDir.base
        }
    });
});

/**
 * Watch scss and js files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch(srcDir.scss, ['styles']);
    gulp.watch(srcDir.scripts, ['scripts']);
    gulp.watch(['*.html', '_layouts/*.html', '_includes/*.html', '_posts/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);

/**
 * Deploy Site
 */
gulp.task('netlify-deploy', ['styles', 'scripts', 'jekyll-build']);