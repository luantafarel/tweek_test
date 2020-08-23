const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const moment = require('moment')

const userModel = require('./src/models/user')

module.exports.register = async (event, context, callback) => {
    
    try {
    const requestBody = JSON.parse(event.body);

    let { name, email, password, telefone } = requestBody
    // Check if the body of the request is valid
    if (!email || !name || !password) {
        console.error('Validation Failed');
        callback(new Error('Couldn\'t register user because of validation errors.'));
        return;
    }

    // Check if e-mail already exists
    let emailExists
    try {
        emailExists = await userModel.findOne({ email: email })
    } catch (error) {
        callback(new Error('Unexpected error happened'));
        return;
    }
    if (emailExists) {
        console.error('Validation Failed');
        callback(new Error('Email in use'));
        return;
    }

    // Encrypt the password and create the user in the database
    let hashedPassword = await bcrypt.hash(password, 8)
        let user = await userModel.create({
            name: name,
            email: email,
            telefone: telefone,
            password: hashedPassword,
            lastLogin: null
        })

        if (!user) {
            console.error('User not created');
            callback(new Error('Failed to create user'));
            return;
        }

        callback(null, {
            statusCode: 200,
            body: JSON.stringify({
                message: `Sucessfully created user with email ${email}`,
                candidateId: user.id
            })
        });
    } catch (error) {
        console.error(error);
        callback(new Error('Failed to create user'));
        return;
    }
}

module.exports.login = async (event, context, callback) => {
    const requestBody = JSON.parse(event.body);

    let { email, password } = requestBody
    // Check if the body of the request is valid
    if (!email || !password) {
        console.error('Validation Failed');
        callback(new Error('Couldn\'t login user because of validation errors.'));
        return;
    }

    // Check if the user exists and if the password is valid
    try {
        let userExists = await userModel.findOne({ email: email })
        if (!userExists) {
            console.error('Email/password is wrong');
            callback(new Error('Email/password is wrong'));
            return;
        }
        let passwordValid = await bcrypt.compare(password, userExists.password)

        if (!passwordValid) {
            console.error('Email/password is wrong');
            callback(new Error('Email/password is wrong'));
            return;
        }

        // Generate the authorization token, valid for 30 minutes
        let token = jwt.sign({ id: userExists._id }, process.env.PRIVATE_KEY, { expiresIn: '3h' })
        await userModel.findOneAndUpdate(userExists.id, {
            $set: {
                lastLogin: moment()
            }
        }, { useFindAndModify: false })
        callback(null, {
            statusCode: 200,
            body: JSON.stringify({
                message: `Sucessfully logged user with email ${email}`,
                email,
                token,
                id: userExists._id
            })
        });
    } catch (error) {
        console.error('Validation Failed');
        callback(new Error('Unexpected problem happened'));
        return;
    }
}
