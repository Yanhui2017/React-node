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
    entry:{
        'javascripts/index': './src/js/index.js',
    },
    output: {
        path: path.resolve(__dirname, './public'),
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query:{
                    "presets" : ["es2015","stage-0"]
                }
            },
        ]
    },
};