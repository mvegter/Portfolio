const GitHub = require('./GitHub')
const LinkedIn = require('./LinkedIn')

module.exports = async (obj) => {
  obj.GitHub = await GitHub()
  obj.LinkedIn = await LinkedIn()
}
