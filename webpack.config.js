var path = require('path');

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
                    presets: ["react", "es2015"]
                }
            }
        ]
    }

};