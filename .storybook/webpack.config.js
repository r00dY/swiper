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
            }
        ]
    },
    resolve: {
        modules: ['node_modules', path.resolve(__dirname, '..')]
    },
};