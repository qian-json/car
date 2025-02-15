const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',  // Add this line
    entry: './src/game.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'  // Add this line
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html'
        }),
        new HtmlWebpackPlugin({
            template: './src/changelog.html',
            filename: 'changelog.html'
        })
    ],
    devServer: {
        static: './dist',
        hot: true,
        historyApiFallback: true  // Add this line
    }
};