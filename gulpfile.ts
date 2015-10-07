/// <reference path="./typings/bundle.d.ts" />

import { task, src, dest, watch } from 'gulp';
import * as ts from 'gulp-typescript';
import * as tslint from 'gulp-tslint';
import * as del from 'del';
import * as plumber from 'gulp-plumber';
const notify = require('gulp-notify');
const babel = require('gulp-babel');

const tsProject = ts.createProject('tsconfig.json', <any>{
	typescript: require('typescript')
});

task('watch', ['build', 'lint'], () => {
	watch('./src/**/*.ts', ['build:ts', 'lint']);
});

task('build', ['build:ts']);

task('build:ts', () => {
	return tsProject.src()
		.pipe(plumber({errorHandler: notify.onError('Build error: <%= error.message %>')}))
		.pipe(ts(tsProject))
		.pipe(babel({
			modules: 'commonStrict'
		}))
		.pipe(dest('./built'));
});

task('lint', () => {
	return src('./src/**/*.ts')
		.pipe(plumber({errorHandler: notify.onError('Lint error: <%= error.message %>')}))
		.pipe(tslint(<any>{
			tslint: require('tslint')
		}))
		.pipe(tslint.report('verbose'));
});

task('clean', cb => {
	del(['./built', './tmp'], cb);
});

task('clean-all', ['clean'], cb => {
	del(['./node_modules', './typings'], cb);
});

task('test', ['build', 'lint']);
