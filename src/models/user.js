const mongoose = require('mongoose')
let Schema = mongoose.Schema

let User = new Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      lowercase: true
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      lowercase: true
    },
    telefone: [{
      ddd: {
        type: String,
        maxLenght: 2
      },
      numero: {
        type: String,
        maxLenght: 9
      }
    }],
    password: {
      type: String,
      required: [true, 'password is required']
    },
    lastLogin: {
      type: Date
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', User)