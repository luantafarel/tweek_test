const jwt = require('jsonwebtoken')
const userModel = require('../models/user')

const verifyToken = async (req, res, next) => {
  let token = req.headers['authorization']

  if (!token) {
    res.status(401)
    return next('no token provided')
  }

  // Check if token is valid
  jwt.verify(token, process.env.PRIVATE_KEY, async (err, decoded) => {
    if (err) {
      res.status(401)
      return next({ errors: [{ msg: err.message }], realError: err })
    }
    let user = await userModel.findById(decoded.id)
    if (!user) {
      res.status(401)
      return next({ errors: [{ msg: 'user deleted' }], realError: err })
    }
    req.jwtId = decoded.id
    next()
  })
}

module.exports = {
  verifyToken
}