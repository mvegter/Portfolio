const hb = require('handlebars');
const fs = require('fs');
const path = require('path');
const { copyFolderRecursiveSync, getAllFiles } = require('./utilities');
const applyProviders = require('./providers');
const minify = require('minify');

const generate = (source, destination, data) => {
  const template = fs.readFileSync(path.resolve(source, 'index.hbs'), 'utf-8');
  const compiled = hb.compile(template);
  const html = compiled(data);

  // Write HTML file
  if (fs.existsSync(destination)) {
    fs.rmdirSync(destination, { recursive: true });
  }
  fs.mkdirSync(destination);
  copyFolderRecursiveSync(path.resolve(source, 'assets'), destination);
  copyFolderRecursiveSync(path.resolve(source, 'css'), destination);
  copyFolderRecursiveSync(path.resolve(source, 'js'), destination);
  fs.writeFileSync(path.resolve(destination, 'index.html'), html);

  if (data.cname) {
    fs.writeFileSync(path.resolve(destination, 'CNAME'), data.cname);
  }
};

const minifyDir = async (dir) => Promise.all(getAllFiles(dir)
  .filter((file) => String(file).endsWith('.css') || String(file).endsWith('.js') || String(file).endsWith('.html'))
  .map(async (file) => fs.writeFileSync(file, await minify(file))));

(async () => {
  try {
    const config = require('./config');

    await applyProviders(config);

    // Compile said template
    hb.registerHelper('breaklines', (text) => {
      text = hb.Utils.escapeExpression(text);
      text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
      return new hb.SafeString(text);
    });

    const distDir = path.resolve(__dirname, '..', 'dist');
    const srcDir = path.resolve(__dirname, '..', 'src');
    generate(srcDir, distDir, config);
    await minifyDir(distDir);

    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    process.exit(1);
  }
})();
