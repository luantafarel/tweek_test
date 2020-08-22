require('dotenv').config()

const cors = require('cors')
const helmet = require('helmet')
const db = require('./config/db')
const routes = require('./routing')
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('./config/winston').logger
const config = require('./config/env/config')
const errorHandler = require('./middlewares/errorHandler')

let app = express()
if (process.env.NODE_ENV !== 'production') {
  // Set server variables
  app.set('env', config.env)
  app.set('hostname', config.hostname)
}
app.set('port', process.env.PORT || 5000)
// Middlewares
app.use(cors())
app.use(helmet())
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: false
  })
)

// Add routing
app.use(routes)

// Add erro handling
app.use(errorHandler)
let server
db.connect()
  .then(function () {
    let hostname = app.get('hostname'),
      port = app.get('port')

    server = app.listen(port, function () {
      logger.info(`Express app listening on http://${hostname}:${port}/api`)
    })
  })
  .catch(function (error) {
    logger.error(error)
  })

function stop() {
  server.close();
}

module.exports = app
module.exports.stop = stop;