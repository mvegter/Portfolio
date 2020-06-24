var hb = require('handlebars')
var fs = require('fs')
var path = require('path')
var { copyFolderRecursiveSync } = require('./utilities')
const applyProviders = require('./providers')

const generate = (source, destination, data) => {
  var template = fs.readFileSync(path.resolve(source, 'index.hbs'), 'utf-8')
  var compiled = hb.compile(template)
  var html = compiled(data)

  // Write HTML file
  if (fs.existsSync(destination)) {
    fs.rmdirSync(destination, { recursive: true })
  }
  fs.mkdirSync(destination)
  copyFolderRecursiveSync(path.resolve(source, 'assets'), destination)
  copyFolderRecursiveSync(path.resolve(source, 'css'), destination)
  copyFolderRecursiveSync(path.resolve(source, 'js'), destination)
  fs.writeFileSync(path.resolve(destination, 'index.html'), html)

  if (data.cname) {
    fs.writeFileSync(path.resolve(destination, 'CNAME'), data.cname)
  }
}

(async () => {
  try {
    const config = require('./config')
    await applyProviders(config)

    // Compile said template
    hb.registerHelper('breaklines', function (text) {
      text = hb.Utils.escapeExpression(text)
      text = text.replace(/(\r\n|\n|\r)/gm, '<br>')
      return new hb.SafeString(text)
    })

    const distDir = path.resolve(__dirname, '..', 'dist')
    const srcDir = path.resolve(__dirname, '..', 'src')
    generate(srcDir, distDir, config)

    process.exit(0)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
})()
