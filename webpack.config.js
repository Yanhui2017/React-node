var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
var webpack = require('webpack');
//Plugin
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('javascripts/common.js');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    //插件项
    plugins: [
        new ExtractTextPlugin("styles.css"),
        commonsPlugin
    ],
    //页面入口文件配置
    // entry: [
    //     "webpack-dev-server/client?http://127.0.0.0:3000",
    //     'webpack/hot/only-dev-server',
    //     path.resolve(__dirname, './src/js/index.js'),
    //     path.resolve(__dirname, './src/img/base/Star.png'),

    // ],
    entry:{
        'javascripts/index': './src/js/index.js',
        // 'javascripts/Lio': './src/js/lio.js',
        // 'javascripts/util/util': './src/js/util/util.js',
        // 'javascripts/static/static': './src/js/static/static.js',
        // 'stylesheets/index': './src/css/index.scss'
    },
    //入口文件输出配置
    output: {
        path: path.resolve(__dirname, './public'),
        filename: '[name].js'
    },
    module: {
        //加载器配置
        loaders: [
            //.css 文件使用 style-loader 和 css-loader 来处理
            { 
                test: /\.css$/, 
                loader: ExtractTextPlugin.extract("style-loader", "css-loader") 
            },
            //.js 文件使用 jsx-loader 来编译处理
            //{ test: /\.js$/, loader: 'jsx-loader?harmony' },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query:{
                    "presets" : ["es2015","stage-0"]
                }
            },
            //.scss 文件使用 style-loader、css-loader 和 sass-loader 来编译处理
            { 
                test: /\.scss$/, 
                loader: 'style!css!sass?sourceMap'
            },
            //图片文件使用 url-loader 来处理，小于8kb的直接转为base64
            { 
                test: /\.(png|jpg)$/, 
                loader: 'url-loader?limit=8192'
            }
        ]
    },
    //其它解决方案配置
    resolve: {
        //查找module的话从这里开始查找
        //root: 'E:/github/flux-example/src', //绝对路径
        //自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
        extensions: ['', '.js', '.json', '.scss'],
        //模块别名定义，方便后续直接引用别名，无须多写长长的地址
        // alias: {
        //     AppStore : 'js/stores/AppStores.js',//后续直接 require('AppStore') 即可
        //     ActionType : 'js/actions/ActionType.js',
        //     AppAction : 'js/actions/AppAction.js'
        // }
    }
};