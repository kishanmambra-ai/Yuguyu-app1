const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  blockList: [
    /node_modules\/.*\/android\/.*/,
    /node_modules\/.*\/ios\/.*/,
    /node_modules\/.*\/\.git\/.*/,
    /\.cache\/.*/,
    /\.expo\/.*/,
  ],
};

config.watcher = {
  ...config.watcher,
  watchman: false,
  additionalExts: ['cjs'],
};

module.exports = config;
