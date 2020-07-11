const fs = require('fs')
const path = require('path')

const getAllFiles = (basePath, found = []) => {
  fs.readdirSync(basePath).forEach((file) => {
    if (fs.lstatSync(path.resolve(basePath, file)).isDirectory()) {
      found = getAllFiles(path.resolve(basePath, file), found)
    } else {
      found.push(path.resolve(basePath, file))
    }
  })

  return found
}

module.exports = getAllFiles
