const hb = require('handlebars');
const fs = require('fs');
const path = require('path');
const copyFolderRecursiveSync = require('./copyFolderRecursiveSync');

const generate = async (source, destination, data) => {
  // Set the generated date/time
  data.date = new Date().toUTCString();

  hb.registerHelper('breaklines', (text) => {
    text = hb.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new hb.SafeString(text);
  });

  hb.registerHelper('ifEquals', function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });

  // Compile said template
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
};

module.exports = generate;
