const path = require('node:path');

module.exports = {
    entry: './src/index.ts',
    outdir: './dist',
    target: 'web',
    sourcemap: true,
    loader: {
        '.png': 'file',
        '.json': 'file',
        '.atlas': 'file',
    },
    resolveExtensions: ['.ts', '.js'],
};
