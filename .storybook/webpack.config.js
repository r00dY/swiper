const path = require("path");

module.exports = {
    module: {
        rules: [
            {
                test: /\.scss$/,
                loaders: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ["react", "es2015"]
                }
            }
        ]
    },
    resolve: {
        modules: ['node_modules', path.resolve(__dirname, '..')]
    },
};