import path from 'node:path';
import { defineConfig } from '@rspack/cli';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
import { rspack } from '@rspack/core';

const shouldAnalyze = process.env.RSDOCTOR === 'true';
console.log(`Rsdoctor analysis will${shouldAnalyze ? ' 🩺' : ' ❌'} run (process.env.RSDOCTOR=${process.env.RSDOCTOR})`);

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
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [
        // Automatically generate an index.html file, using the one in the public folder
        new HtmlWebpackPlugin({
            template: './public/index.html', // Path to your HTML template in the public folder
        }),
        new rspack.CopyRspackPlugin({
            patterns: [
                { from: './public/assets', to: 'assets' },
            ],
        }),
        process.env.RSDOCTOR === 'true' &&
        new RsdoctorRspackPlugin({
            analyzerMode: 'server',
            openAnalyzer: true,
            port: 8888,
        }),

    ].filter(Boolean), // Filter out false values (e.g., if shouldAnalyze is false)
});
