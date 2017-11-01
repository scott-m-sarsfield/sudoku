/* eslint-disable no-console */
const gulp = require('gulp');

const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const mocha = require('gulp-mocha');
const gutil = require('gulp-util');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');
const notifierReporter = require('mocha-notifier-reporter');
const mustache = require('gulp-mustache');
const extReplace = require('gulp-ext-replace');
const prettify = require('gulp-html-prettify');

const argv = require('yargs').argv;

gulp.task('default', ['mocha', 'javascript', 'static-files', 'renderStatic', 'init-browser-sync'], () => {
	gulp.watch(['www', 'www/**'], ['static-files']);
	gulp.watch(['templates/**', 'src/**'], ['renderStatic', 'javascript']);
	gulp.watch(['src/**', 'test/**'], ['mocha']);

	gulp.watch(['dist/**']).on('change', browserSync.reload);
});

gulp.task('javascript', () => {
	const b = browserify({
		entries: './src/app.js',
		debug: true
	});

	return b.transform(babelify).bundle()
        .pipe(source('app.js')) // App.js is a pretend file name, BTW
        .pipe(buffer())
        .pipe(gulp.dest('./dist/js/'));
});

gulp.task('mocha', () => {
	return gulp.src(['./test/*.js'], {read: false})
        .pipe(mocha({reporter: notifierReporter.decorate('spec')}))
        // .pipe(mocha({reporter:'mocha-notifier-reporter'}));
        .on('error', gutil.log);
});

gulp.task('static-files', () => {
	return gulp.src(['./www/**'])
        .pipe(gulp.dest('./dist/'));
});

gulp.task('init-browser-sync', () => {
	browserSync.init({
		server: {
			baseDir: './dist/'
		}
	});
});

gulp.task('notify', () => {
	return gulp.src(['./src/**'])
        .pipe(notify('Hello Gulp!'));
});

gulp.task('renderStatic', () => {
    // This is probably dumb.
	Object.keys(require.cache).forEach(key => {
		if (!key.match(/node_modules/)) {    // Only want to delete the require cache for my files.
			console.log(key);
			delete require.cache[key];
		}
	});

	try {
		const staticReactContent = require('./static_react').default;
		return gulp.src('./templates/*.mustache')
        .pipe(mustache(staticReactContent))
        .pipe(extReplace('.html'))
        .pipe(prettify({indent_char: ' ', indent_size: 2})) // eslint-disable-line camelcase
        .pipe(gulp.dest('./dist'));
	} catch (err) {
		console.log(err.stack);
	}
});

gulp.task('copy', () => {
	const destination = argv.dest || argv.d;
	if (!destination) {
		console.log('Usage:\ngulp copy --dest <destination>');
		return;
	}
	return gulp.src(['./**', '!./node_modules/**'])
            .pipe(gulp.dest(argv.dest));
});
