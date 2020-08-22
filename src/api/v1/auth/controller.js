const bcrypt = require('bcryptjs')
const Boom = require('@hapi/boom')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const { validationResult } = require('express-validator')

const userModel = require('../../../models/user')

const register = async (req,res,next) => {
    const errors = validationResult(req)

    // Check if the body of the request is valid
    if(!errors.isEmpty()) {
        res.status(422).send(Boom.badData('Some parameters are missing or incorrect'))
    }

    let { name,email,password,telefone } = req.body

    // Check if e-mail already exists
    let emailExists
    try {
        emailExists = await userModel.findOne({ email: email })
    } catch(error) {
        return res.status(500).send(Boom.badImplementation('Unexpected problem happened'))
    }
    if(emailExists) {
        return res.status(409).send(Boom.conflict('Email in use'))
    }

    // Encrypt the password and create the user in the database
    let hashedPassword = await bcrypt.hash(password,8)
    try {
        let user = await userModel.create({
            name: name,
            email: email,
            telefone: telefone,
            password: hashedPassword,
            lastLogin: null
        })

        if(!user) {
            throw new error('user not generated')
        }

        return res.status(201).json({
            msg: 'user registered successfully',
            id: user.id
        })
    } catch(error) {
        return res.status(500).send(Boom.badImplementation('Unexpected problem happened'))
    }
}

const login = async (req,res,next) => {
    const errors = validationResult(req)

    // Check if the body of the request is valid
    if(!errors.isEmpty()) {
        res.status(422).send(Boom.badData('Some parameters are missing or incorrect'))
    }

    let { email,password } = req.body

    // Check if the user exists and if the password is valid
    try {
        let userExists = await userModel.findOne({ email: email })
        if(!userExists) res.status(401).send(Boom.badData('Email/password is wrong'))
        let passwordValid = await bcrypt.compare(password,userExists.password)

        if(!passwordValid) res.status(401).send(Boom.badData('Email/password is wrong'))
        // Generate the authorization token, valid for 30 minutes
        let token = jwt.sign({ id: userExists._id },process.env.PRIVATE_KEY,{expiresIn: '30m'})
        await userModel.findOneAndUpdate(userExists.id,{
            $set: {
                lastLogin: moment()
            }
        },{ useFindAndModify: false })
        res.set('Authorization',token)
        res.status(200).json({
            msg: 'user logged in successfully',
            email,
            token,
            id: userExists._id
        })
    } catch(error) {
        res.status(500).send(Boom.badImplementation('Unexpected problem happened'))
    }
}

module.exports = { register,login }