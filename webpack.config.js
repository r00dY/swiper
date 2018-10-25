var path = require('path');
var webpack = require("webpack");

module.exports = {

    entry: {
        'bundle': './index.js',
        'react': './presets/React/index.js',
    },
    output: {
        libraryTarget: "umd",
        library: "SimpleSwiper",
        filename: '[name].js',
        path: path.resolve(__dirname, './'),
        globalObject: `typeof self !== 'undefined' ? self : this`
    },

    externals: [
        {
            "react-dom": {
                root: "ReactDOM",
                commonjs2: "react-dom",
                commonjs: "react-dom",
                amd: "react-dom"
            }
        },
        {
            react: {
                root: "React",
                commonjs2: "react",
                commonjs: "react",
                amd: "react"
            }
        },
        {
            "prop-types": {
                root: "PropTypes",
                commonjs2: "prop-types",
                commonjs: "prop-types",
                amd: "prop-types"
            }
        },
    ],

    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ["react", "es2015", "stage-0"]
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
                APP_ENV: JSON.stringify('browser')
            }
        })
    ]

};