import path from 'node:path';
import { defineConfig } from '@rspack/cli';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

export default defineConfig({
    entry: './src/index.ts',
    target: 'web',
    output: {
        path: path.resolve("./", 'builds/prod'),
        filename: 'bundle.js',
        clean: true,
    },
    mode: 'production',
    devtool: false,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|json|atlas)$/,
                type: 'asset/',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    // devServer: {
    //     static: path.join("./", 'dist'),
    //     compress: true,
    //     port: 3000,
    //     open: true,
    // },
    plugins: [
        // Automatically generate an index.html file, using the one in the public folder
        new HtmlWebpackPlugin({
            template: './public/index.html', // Path to your HTML template in the public folder
        }),
        // Copy the index.css from the public folder to the build folder
        // new CopyPlugin({
        //     patterns: [
        //         { from: './public/index.css', to: 'index.css' }, // Path to the CSS file in the public folder
        //     ],
        // }),
    ],
});
