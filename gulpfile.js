// Сам Gulp
const gulp = require('gulp');
// Шаблонизатор файлов
const fileinclude = require('gulp-file-include');
// Компилирование SCSS файлы в CSS, с указанием на использование компилятора SASS.
const sass = require('gulp-sass')(require('sass'));
// Локальный сервер
const server = require('gulp-server-livereload');
// Удаление файлов и дирикторий
const clean = require('gulp-clean');
// Работа с файловой системой: запись, удаление файлов и директорий.
const fs = require('fs');
// Генерирует карты кода для отладки CSS и JavaScript файлов.
const sourceMaps = require('gulp-sourcemaps');
// Группирует медиа запросы в итоговом CSS
const groupMedia = require('gulp-group-css-media-queries');
// Предотвращает остановку автоматической сборки при возникновении ошибок в Gulp.
const plumber = require('gulp-plumber');
// Уведомления для разработчиков.
const notify = require('gulp-notify');
// Интегрирует Webpack в Gulp, позволяя запускать сборку модулей Webpack в рамках потоков Gulp.
const webpack = require('webpack-stream')
// Транспиляция cовременного JavaScript, для поддержки в старых браузерах.
const babel = require('gulp-babel');
// Уменьшение размера изображений
const imagemin = require('gulp-imagemin');



// Настройка для Plumber, для вывода ошибок сборки в консоль.

const plumberNotify = (title) => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	};
};


// Подключение HTML блоков

const fileIncludeSettings = {
    prefix: '@@',
    basepath: '@file'
};

gulp.task('html', function() {
    return gulp
        .src('./src/*.html')
        .pipe(plumber(plumberNotify('HTML'))) // оповещение в косоль об ошибках
        .pipe(fileinclude(fileIncludeSettings))
        .pipe(gulp.dest('./dist/'))
});

// Сборка CSS из SASS

gulp.task('sass', function() {
    return gulp
        .src('./src/scss/*.scss')
        .pipe(plumber(plumberNotify('SCSS'))) // оповещение в косоль об ошибках
        .pipe(sourceMaps.init()) //инициализация карт для sass
        .pipe(sass())
        .pipe(groupMedia()) // группировка медиа запросов
        .pipe(sourceMaps.write())  //запись карт для sass
        .pipe(gulp.dest('./dist/css/'))
});

// Сборщик JS

gulp.task('js', function() {
    return gulp
        .src('./src/js/**.*.js')
        .pipe(plumber(plumberNotify('JS'))) // оповещение в косоль об ошибках
        .pipe(babel())
        .pipe(webpack(require('./webpack.confg.js'))) // принимает настройки из webpack.confg.js
        .pipe(gulp.dest('./dist/js'))
})

// Копирование изображений

gulp.task('images', function() {
    return gulp
        .src('./src/img/**/*')
        .pipe(imagemin({verbose: true})) // уменьшение размера изображения
        .pipe(gulp.dest('./dist/img/'))
});

// Копирование шрифтов

gulp.task('fonts', function() {
    return gulp
        .src('./src/fonts/**/*')
        .pipe(gulp.dest('./dist/fonts/'))
});

// Запуск сервера

const serverOptions = {
    livereload: true,
    open: true
};

gulp.task('server', function() {
    return gulp
        .src('./dist/')
        .pipe(server(serverOptions))
});

// Очистка папки

gulp.task('clean', function(done) {
    // проверка папки на существование, которую хотим удалить
    if (fs.existsSync('./dist/')) {
        return gulp
            .src('./dist/', {read: false})
            .pipe(clean({force: true}))
    }
    done()
});


// Автоматический запуск задач при изменении файлов

gulp.task('watch', function() {
    gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass'));
    gulp.watch('./src/**/*.html', gulp.parallel('html'));
    gulp.watch('./src/js/**/*.js', gulp.parallel('js'));
    gulp.watch('./src/img/**/*', gulp.parallel('images'));
    gulp.watch('./src/fonts/**/*', gulp.parallel('fonts'));
});

// Запуск каскада задач

gulp.task('default', gulp
    .series('clean', 
        gulp.parallel('html', 'sass', 'js', 'images', "fonts"),
        gulp.parallel('server', 'watch')
));