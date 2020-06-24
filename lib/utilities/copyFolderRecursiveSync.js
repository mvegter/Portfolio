var fs = require('fs')
var path = require('path')
var copyFileSync = require('./copyFileSync')

function copyFolderRecursiveSync (source, target) {
  var files = []

  // check if folder needs to be created or integrated
  var targetFolder = path.join(target, path.basename(source))
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder)
  }

  // copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source)
    files.forEach(function (file) {
      var curSource = path.join(source, file)
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder)
      } else {
        copyFileSync(curSource, targetFolder)
      }
    })
  }
}

module.exports = copyFolderRecursiveSync
