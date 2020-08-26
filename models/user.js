const mongoose = require('mongoose');
const validator = require('validator');

const model = mongoose.model('User', {
  name: {
    type: String,
    required: true,
    validate: {
      validator(name) {
        return validator.isAlphanumeric(name);
      },
    },
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      }
    }
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator(firstname) {
        return validator.isAlphanumeric(firstname);
      },
    },
  },
  lastLogin: {
    type: Date
  }
},
  { timestamps: true }
)

module.exports = model;
