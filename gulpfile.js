var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    sass        = require('gulp-sass'),
    autoprefixer= require('gulp-autoprefixer'),
    cp          = require('child_process');

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/////////////////////////////////////////
// Set Directories
/////////////////////////////////////////

// Set Output Directory
var outputDir = {
    base: './_site',
    baseCss: './_site/css',
    css: './css'
}

// Set Source Directory
var srcDir = {
    scss: './_scss/**/*.scss',
    scripts: './_scripts/*.js',
    images: './_images/**/*.{png,gif,jpg,jpeg,svg}',
    fonts: './_fonts/*.{eot,svg,ttf,woff}',
    bower_components: './bower_components/**/*'
};

var sassPaths = [
  'bower_components/normalize.scss/sass',
  'bower_components/foundation-sites/scss',
  'bower_components/motion-ui/src'
];

/////////////////////////////////////////
//       Start Gulp Tasks
/////////////////////////////////////////

// Clean site directory
gulp.task('clean', require('del').bind(null, '_site'));

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
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: outputDir.base
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function() {
  return gulp.src('_sass/app.scss')
    .pipe(sass({
            includePaths: sassPaths,
            onError: browserSync.notify
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('_site/css'))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('css'));
});

// Concatenate and Minify JavaScript 
/*gulp.task('scripts', function(){
  return gulp.src(srcDir.scripts)
    .pipe(concat('app.js'))
    .on('error', gutil.log)
    .pipe(gulp.dest(outputDir.base + '/scripts/'))
     .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(gulp.dest(outputDir.base + '/scripts/'))
    //.pipe(notify({ message: 'Scripts include task complete' }));
});*/

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

/*// Copy Fonts
gulp.task('copyFonts', function() {
  return gulp.src(srcDir.fonts, {base:"app/fonts/"})
    .pipe(gulp.dest(outputDir + '/fonts/'))
    //.pipe(notify({ message: 'Copy Fonts task complete' }));
});

// Copy Bower Components
gulp.task('copyBower', function() {
  return gulp.src(srcDir.bower_components, {base:"app"})
    .pipe(gulp.dest(outputDir + '/bower_components/'))
    //.pipe(notify({ message: 'Copy Bower Components task complete' }));
});

// Copy Fonts, and Bower Components
gulp.task('copy', ['copyFonts', 'copyBower']);
*/

/**
 * Watch scss and js files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('_scss/*.scss', ['sass']);
    //gulp.watch('./_scripts/**/*.js', ['scripts']);
    gulp.watch(['*.html', '_layouts/*.html', '_includes/*.html', '_posts/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);