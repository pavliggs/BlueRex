const gulp = require('gulp');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const del = require('del');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const uncss = require('gulp-uncss');
const gcmq = require('gulp-group-css-media-queries');
const cache = require('gulp-cache');
const pngquant = require('gulp-pngquant');
const imgCompress = require('imagemin-jpeg-recompress');
const imgPngquant = require('imagemin-pngquant');
const less = require('gulp-less');
const sass = require('gulp-sass');

/* если к команде gulp watch добавить --dev, то эта переменная будет равняться true и наоборот
выражение ниже позволяет не менять вручную gulpfile.js
читается так: если массив argv включает --dev, то переменная будет true */
const isDev = process.argv.includes('--dev');
const isBuild = process.argv.includes('--build');

// массив нужен для точного порядка подключения css-файлов
// const cssFiles = [
//     './node_modules/normalize.css/normalize.css',
//     './src/css/style.css', 
//     './src/css/some.css'
// ];

const jsFiles = [
    './src/js/popper.min.js',
    './src/js/bootstrap.js',
    './src/js/lightbox.js',
    './src/js/script.js'
];
 
gulp.task('styles', () => {
    return gulp.src('./src/styles/main.scss')
        // запускает pipe(sourcemaps.init()) только если переменная isDev равна true
        .pipe(gulpif(isDev, sourcemaps.init())) 
        .pipe(sass())
        // сцепляет все файлы css в один файл (не нужен, если используются препроцессоры) 
        // .pipe(concat('main.css'))
        // правильно объединяет медиа запросы
        .pipe(gcmq())
        /* удаляет неиспользуемый css код, но его использование может привести к неправильной работе,
        если какие-то теги, классы или айди появляются в html динамически при помощи JS */
        // .pipe(gulpif(isBuild, uncss({
        //     html: ['./build/*.html']
        // })))
        .pipe(autoprefixer({
            cascade: false
        }))
        // сжимает css, объединяет media запросы и т.д.
        .pipe(gulpif(isBuild, cleanCSS({
            // compatibility: 'ie8',
            level: 2
        })))
        .pipe(gulpif(isDev, sourcemaps.write()))
        .pipe(gulp.dest('./build/css'))
        .pipe(gulpif(isDev, browserSync.stream()));
});

gulp.task('scripts', () => {
    return gulp.src(jsFiles)
        .pipe(concat('main.js'))
        // сжимает js, минимизирует имена функций и переменных
        .pipe(gulpif(isBuild, uglify({
            toplevel: true
        })))
        .pipe(gulp.dest('./build/js'))
        .pipe(gulpif(isDev, browserSync.stream()));
});

gulp.task('html', () => {
    return gulp.src('./src/*.html')
        .pipe(gulp.dest('./build'))
        .pipe(gulpif(isDev, browserSync.stream()));
});

gulp.task('compress', () => {
    if (isBuild) {
        return gulp.src('./src/img/**/*')
            /*.pipe(imagemin({
                interlaced: true,
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                // use: [pngquant()],
                plugins: imgPngquant({
                    quality: '70-90', 
                    speed: 1,
                    floyd: 1
                })
            }))*/
            //наиболее оптимальный вариант сжатия изображений
            .pipe(imagemin([
                imgCompress({
                    loops: 4,
                    min: 70,
                    max: 80,
                    quality: 'high'
                }),
                imagemin.gifsicle(),
                imagemin.optipng(),
                imagemin.svgo()
            ]))
            .pipe(gulp.dest('./build/img'));
    } else {
        return gulp.src('./src/img/**/*')
            .pipe(gulp.dest('./build/img'));
    }
});

gulp.task('watch', () => {
    if (isDev) {
        browserSync.init({
            server: {
                baseDir: "./build/"
            },
            /* создает url-adress текущего проекта, к которому можно 
            обратиться любому человеку с любого устройства */
            // tunnel: true
        });
    }
    // при любом изменении файлов в данных папках будут выполняться следующие функции
    gulp.watch('./src/styles/**/*.scss', gulp.task('styles'));
    gulp.watch('./src/js/**/*.js', gulp.task('scripts'));
    gulp.watch('./src/*.html',gulp.task('html'));
    gulp.watch('./src/img/**/*', gulp.task('compress'));
});

gulp.task('clear', () => {
    // удаляет всё, что есть в папке dist
    return del(['build/*']);
});

// сначала очищаем папку dist, а затем параллельно выполняем таски
let build = gulp.series('clear', gulp.parallel(['styles', 'scripts', 'html', 'compress']));
gulp.task('development', gulp.series(build, 'watch'));