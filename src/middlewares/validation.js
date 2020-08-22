const { body } = require('express-validator')
const _ = require('lodash')
const validateRegistrationBody = () => {
  return [
    body('name')
      .exists()
      .withMessage('name field is required')
      .isLength({ min: 3 })
      .withMessage('name must be greater than 3 letters'),
    body('email')
      .exists()
      .withMessage('email field is required')
      .isEmail()
      .withMessage('email is invalid'),
    body('password')
      .exists()
      .withMessage('password field is required')
      .isLength({ min: 8 })
      .withMessage('password must be greater then 8 letters'),
    body('telefone')
      .isArray()
      .withMessage('Telefones must be an array of objects')
      .custom(arr => {
        return arr.every((element) => {
          // element is each element in the array
          return _.has(element, 'ddd') && _.has(element, 'numero')
        })
      })
      .withMessage('Object in telefone must have ddd and numero')
      .custom(arr => {
        return arr.every((element) => {
          // element is each element in the array
          if (((typeof element.ddd === 'string') && (element.ddd.length === 3)) && ((typeof element.numero === 'string') && ((element.numero.length === 9) || (element.numero.length === 8)))) return true
          else return false
        })
      })
      .withMessage('Problems with phone number')
  ]
}

const validateLoginBody = () => {
  return [
    body('email')
      .exists()
      .withMessage('email field is required')
      .isEmail()
      .withMessage('email is invalid'),
    body('password')
      .exists()
      .withMessage('password field is required')
      .isLength({ min: 8 })
      .withMessage('password must be greater then 8 letters')
  ]
}

module.exports = {
  validateRegistrationBody,
  validateLoginBody
}