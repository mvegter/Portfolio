const fs = require('fs');
const minify = require('minify');
const getAllFiles = require('./getAllFiles');

const minifyDir = async (dir) => Promise.all(getAllFiles(dir)
  .filter((file) => String(file).endsWith('.css') || String(file).endsWith('.js') || String(file).endsWith('.html'))
  .map(async (file) => fs.writeFileSync(file, await minify(file))));

module.exports = minifyDir;
