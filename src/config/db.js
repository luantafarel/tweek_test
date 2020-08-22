const mongoose = require('mongoose')
const logger = require('./winston').logger
const collection = 'test'
const user = 'admin'
const password = 'admin'

const connection = {
  mongoAtlas: `mongodb+srv://${user}:${password}@cluster0-cygcu.mongodb.net/test?retryWrites=true&w=majority`,
  mongoLocal: `mongodb://localhost:27017/${collection}`
}
exports.connect = function() {
  return new Promise((resolve,reject) => {
    mongoose
      .connect(connection.mongoAtlas,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 1000
      })
      .then(function() {
        logger.info('MongoDB connected!')
        resolve()
      })
      .catch(function(error) {
        logger.error(error)
        reject(error)
      })
  })
}