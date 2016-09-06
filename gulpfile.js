var gulp = require('gulp');
var del = require('del');
var notify = require('gulp-notify');
var express = require('express');
//实例化express对象
var app = express();
//express指定静态文件目录
app.use('/static', express.static('./public'));
var nodemon = require('nodemon');

//压缩
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var spriter = require('gulp-css-spriter');
var cache = require('gulp-cache');
var pngquant = require('imagemin-pngquant');

//webpack模块化编译
var webpack = require('webpack');
var webpackConfig = require("./webpack.config.js");

//文件监控
var watch = require('gulp-watch');
var changed = require('gulp-changed');
var sizereport = require('gulp-sizereport');

//gulp任务执行顺序
var sequence = require('gulp-sequence');

//重命名文件
var rename = require('gulp-rename');
//问题：如何结合chmod使用
var chmod = require('gulp-chmod');
//给文件添加hash前缀，生成静态文件map，防止缓存
var rev = require('gulp-rev');

var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

//动态刷新
var browserSync = require('browser-sync');
var bs = browserSync.create('My server');

//时间统计
var prettyHrtime = require('pretty-hrtime');

/********** 任务切分线 ******************/

gulp.task('webpack', function(){
    del('./public/js/*');
    var myConfig = Object.create(webpackConfig);
    // run webpack
    webpack(
    // configuration
    myConfig,
    function (err, stats) {
        var end = process.hrtime();
        var words = prettyHrtime(end);
        console.log(words); // '1.2 ms'
        words = prettyHrtime(end, {precise:true});
        console.log(words); // '1.20958 ms'

        // if(err) throw new gutil.PluginError("webpack", err);
        // gutil.log("[webpack]", stats.toString({
        //   // output options
        // }));
        //callback();
    });
});

//jade和scss编译任务
gulp.task('compile', function() {
	gulp.src('./src/css/*.scss',{base : 'src'})
  	//文件添加前缀
  	.pipe(autoprefixer({
  		browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
          cascade: true, //是否美化属性值 默认：true 像这样：
          remove:true //是否去掉不必要的前缀 默认：true 
  	}))
  	//编译scss 
  	//style有四种编译格式:1.nested 2.expanded 3.compact 4.compressed
  	.pipe(sass({style:"nested"}))
  	// 保存一份编译完的
  	// .pipe(gulp.dest('./dest'))
  	//输出压缩文件到指定目录
  	.pipe(gulp.dest('./dest'))
  	//提醒任务完成
  	.pipe(notify({message:'====编译结束===='}))
});

//压缩js和css任务
gulp.task('push', function(){
	//图片压缩问题：大小没变，压缩的条件是什么？
	//压缩css
	var timestamp = +new Date();
    del('./dest/img/sprite/*');
	gulp.src('./dest/css/*.css')
		//对backgound／background-image生成雪碧图
		.pipe(spriter({
        // 生成的spriter的位置
        'spriteSheet': './dest/img/sprite/sprite'+timestamp+'.png',
        // 生成样式文件图片引用地址的路径
        // 如下将生产：backgound:url(../images/sprite20324232.png)
        'pathToSpriteSheetFromCSS': '../img/sprite/sprite'+timestamp+'.png'
    }))
    //压缩样式文件
		.pipe(minifycss())
		//给文件添加.min后缀
		.pipe(rename({ suffix: '.min' }))
    .pipe(rev())
    .pipe(gulp.dest('./dest/css/assets'))
    .pipe(rev.manifest())
    .pipe(chmod(755))
		.pipe(gulp.dest('./'))
    //.pipe(size()) //我怎么没看到效果

	//压缩图片
	gulp.src('./src/img/*.{png,jpg,gif,ico,jpeg}')
        .pipe(imagemin({
            optimizationLevel: 7, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        }))
        .pipe(gulp.dest('./dest/img'))
        .pipe(notify({message:'====图片压缩结束===='}));

    //只压缩修改的图片。压缩图片时比较耗时，在很多情况下我们只修改了某些图片，
    //没有必要压缩所有图片，使用”gulp-cache”只压缩修改的图片，没有修改的图片直接从缓存文件读取
    gulp.src('./src/img/*.{png,jpg,gif,ico,jpeg}')
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('./dest/img'))
        .pipe(notify({message:'====修改过的图片压缩结束===='}));

  	//压缩js
  	gulp.src('./src/*.js')
        //只把修改过的已js结尾的文件进行编译
        .pipe(changed('./dest/*.{js}'))
  		  .pipe(uglify({
  	        mangle: true,//类型：Boolean 默认：true 是否修改变量名
  	        compress: true,//排除混淆关键字,//类型：Boolean 默认：true 是否完全压缩
  	        preserveComments: 'all' //保留所有注释
  	    }))
  	    .pipe(rename({ suffix: '.min' }))
  	    .pipe(gulp.dest('./dest'))
        .pipe(sizereport({
            gzip: true,
        }))
  	    .pipe(notify({message:'====压缩结束===='}))

    //压缩html
    gulp.src('./dest/*.html')
        //删除空格进行压缩
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./dest'))

});

// 监控任务
gulp.task('watch', function(){
	//监控哪些文件，并执行哪些任务来处理
	gulp.watch('./src/css/*.scss',['compile'])
	.on('change', function(){
		//浏览器重新刷新
		browserSync.reload();
		console.log('====文件改变监控，重新编译完成====');
	})
});

gulp.task('dev:server', function () {
  app.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
  })
  app.listen(3000)
  // 启动node
  nodemon({
    script: './app.js',
    ignore: ['.vscode', '.idea', 'node_modules'],
    env: {
      'NODE_ENV': 'development'
    }
  });

  bs.init(null, {
    proxy: 'http://localhost:' + 5000,
    baseDir: "./public",
    files: ['./public/*.html'],
    notify: false,
    open: true,
    port: 3000
  })
});

gulp.task('default', function() {
  // 将你的默认的任务代码放在这
  console.log('Start-gulp');
});
gulp.task('sequence', sequence('default',['compile', 'webpack'], 'push', 'dev:server', 'watch'));