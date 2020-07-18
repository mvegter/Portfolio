const copyFileSync = require('./copyFileSync');
const copyFolderRecursiveSync = require('./copyFolderRecursiveSync');
const generate = require('./generate');
const getAllFiles = require('./getAllFiles');
const logger = require('./logger');
const minifyDir = require('./minifyDir');

module.exports = {
  copyFileSync,
  copyFolderRecursiveSync,
  generate,
  getAllFiles,
  minifyDir,
  logger,
};
