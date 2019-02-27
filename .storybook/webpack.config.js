const path = require("path");

module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                loaders: ["style-loader", "css-loader"],
            },
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ["@babel/preset-env", "@babel/preset-react"]
                }
            }
        ]
    },
    resolve: {
        modules: ['node_modules', path.resolve(__dirname, '..')]
    },
};