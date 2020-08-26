const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const mongoose = require('mongoose');
const userModel = require('./models/user');
const s3Conf = require('./config/s3');
const uuid = require("uuid/v4");
const AWS = require('aws-sdk');
const exif = require('exiftool');
const fs = require('fs');

const mongoString = 'mongodb+srv://admin:admin@cluster0-cygcu.mongodb.net/test?retryWrites=true&w=majority';
const dbExecute = (db, fn) => db.then(fn).finally(() => db.close());
const key = 'c4d36f85-e767-4cb7-962f-313942e5b2cc';
const s3 = new AWS.S3({
    accessKeyId: s3Conf._id,
    secretAccessKey: s3Conf.key
});
function dbConnectAndExecute(dbUrl, fn) {
    return dbExecute(mongoose.connect(dbUrl, { useMongoClient: true }), fn);
}

module.exports.register = async (event, context, callback) => {
    try {
        const requestBody = JSON.parse(event.body);

        let { name, email, password } = requestBody
        // Check if the body of the request is valid
        if (!email || !name || !password) {
            console.error('Validation Failed');
            callback(null, {
                statusCode: 406,
                body: JSON.stringify({
                    message: 'Couldn\'t register user because of validation errors.'
                })
            });
            return;
        }
        // Check if e-mail already exists
        await dbConnectAndExecute(mongoString, () => (
            userModel
                .find({ email: email })
                .then(user => {
                    if (user) {
                        console.error('Validation Failed');
                        callback(null, {
                            statusCode: 406,
                            body: JSON.stringify({
                                message: 'Email in use',
                                headers: { 'Content-Type': 'text/plain' },
                            })
                        });
                        return;
                    }
                }).catch(err => {
                    callback(null, {
                        statusCode: 406,
                        body: JSON.stringify({
                            message: 'Couldn\'t register user because of errors in email.',
                            headers: { 'Content-Type': 'text/plain' },
                            body: err.message || 'Incorrect id',

                        })
                    });
                    return;
                })
        ));

        // Encrypt the password and create the user in the database
        let hashedPassword = await bcrypt.hash(password, 8)
        let user = new userModel({
            name: name,
            email: email,
            password: hashedPassword,
            lastLogin: null
        })
        await dbConnectAndExecute(mongoString, () => (
            user
                .save()
                .then(() => {
                    callback(null, {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: `Sucessfully created user with email ${email}`,
                            candidateId: user._id
                        })
                    });
                    return;
                }
                )
                .catch(err => {
                    callback(null, {
                        statusCode: 406,
                        body: JSON.stringify({
                            message: 'Couldn\'t register user because of errors in save',
                            headers: { 'Content-Type': 'text/plain' },
                            body: err.message || 'Incorrect id',
                        })
                    });
                    return;
                }
                )));
        return;
    } catch (error) {
        callback(null, {
            statusCode: 406,
            body: JSON.stringify({
                message: 'Couldn\'t register user because of errors in others',
                headers: { 'Content-Type': 'text/plain' },
                body: error.message || 'Incorrect id',
            })
        });
        return;
    }
}

module.exports.login = (event, context, callback) => {
    try {
        const requestBody = JSON.parse(event.body);

        let { email, password } = requestBody
        // Check if the body of the request is valid
        if (!email || !password) {
            callback(null, {
                statusCode: 406,
                body: JSON.stringify({
                    message: 'Email/password is wrong',
                    headers: { 'Content-Type': 'text/plain' },
                })
            });
            return;
        }
        // Check if e-mail already exists
        dbConnectAndExecute(mongoString, () => (
            userModel
                .find({ email: email })
                .then(user => {
                    if (user) {
                        console.error('Validation Failed');
                        callback(null, {
                            statusCode: 406,
                            body: JSON.stringify({
                                message: 'Email in use',
                                headers: { 'Content-Type': 'text/plain' },
                            })
                        });
                        return;
                    }
                    callback(null, {
                        statusCode: 406,
                        body: JSON.stringify({
                            message: 'user not found.',
                            headers: { 'Content-Type': 'text/plain' }
                        })
                    });
                    return;
                }).catch(err => {
                    callback(null, {
                        statusCode: 406,
                        body: JSON.stringify({
                            message: 'Couldn\'t register user because of errors in email.',
                            headers: { 'Content-Type': 'text/plain' },
                            body: err.message || 'Incorrect id',

                        })
                    });
                    return;
                })
        ));

        // Check if the user exists and if the password is valid
        dbConnectAndExecute(mongoString, () => (
            userModel
                .find({ email: email })
                .then(user => {
                    if (user) {
                        password = bcrypt.compare(password, user.password, (err, password) => {
                            if (err) {
                                callback(null, {
                                    statusCode: 406,
                                    body: JSON.stringify({
                                        message: 'Email/password is wrong',
                                        headers: { 'Content-Type': 'text/plain' },
                                        err: err.message
                                    })
                                });
                                return;
                            }
                            // Generate the authorization token, valid for 30 minutes
                            let token = jwt.sign({ id: user._id, name: user.name }, key, { expiresIn: '3h' })
                            userModel.findByIdAndUpdate(id, {
                                lastLogin: moment()
                            })
                                .then(() => {
                                    callback(null, {
                                        statusCode: 200,
                                        body: JSON.stringify({
                                            message: `Sucessfully logged user with email ${email}`,
                                            email,
                                            token,
                                            id: user._id
                                        })
                                    });
                                    return;
                                })
                                .catch(err => callback(null, {
                                    statusCode: 406,
                                    body: JSON.stringify({
                                        message: 'Email/password is wrong',
                                        headers: { 'Content-Type': 'text/plain' },
                                        error: err.message || 'not found'

                                    })
                                }))
                        })
                    }
                    callback(null, {
                        statusCode: 406,
                        body: JSON.stringify({
                            message: 'Email/password is wrong',
                            headers: { 'Content-Type': 'text/plain' },
                        })
                    });
                    return;
                }).catch(err => {
                    callback(null, {
                        statusCode: 406,
                        body: JSON.stringify({
                            message: 'Couldn\'t login user because of errors',
                            headers: { 'Content-Type': 'text/plain' },
                            body: err.message || 'Incorrect id',

                        })
                    });
                    return;
                })
        ));
    } catch (error) {
        callback(null, {
            statusCode: 406,
            body: JSON.stringify({
                message: 'Couldn\'t login user because of errors',
                headers: { 'Content-Type': 'text/plain' },
                body: error.message || 'Incorrect id',

            })
        });
        return;
    }
}



module.exports.uploadImage = (event, context, callback) => {
    try {
        const encodedImage = JSON.parse(event.body).user_avatar;
        const decodedImage = Buffer.from(encodedImage, 'base64');
        const token = JSON.parse(event.headers.Authorization);
        const decoded = jwt.verify(token, key);

        // Check if the user exists and if the password is valid
        dbConnectAndExecute(mongoString, () => (
            userModel
                .find({ id: decoded })
                .then(user => {
                    exif.metadata(data, function (err, metadata) {
                        if (err) {
                            callback(null, {
                                statusCode: 406,
                                body: JSON.stringify({
                                    message: 'Couldn\'t get metadata',
                                    headers: { 'Content-Type': 'text/plain' },
                                    body: err.message || 'Incorrect id',

                                })
                            });
                            return;
                        }
                        // Setting up S3 upload parameters
                        const params = {
                            Bucket: s3Conf.bucket,
                            Key: '/' + user.name + uuid(),
                            Body: decodedImage,
                            ContentType: metadata.mimeType
                        };
                        // Uploading files to the bucket
                        s3.upload(params, function (err, data) {
                            if (err) {
                                callback(null, {
                                    statusCode: 406,
                                    body: JSON.stringify({
                                        message: 'Couldn\'t upload image',
                                        headers: { 'Content-Type': 'text/plain' },
                                        body: err.message || 'Incorrect id',

                                    })
                                });
                                return;
                            }
                            s3.putObject({
                                Bucket: s3Conf.bucket,
                                Key: '/' + user.name + uuid() + 'metadata.json',
                                Body: JSON.stringify(metadata),
                                ContentType: "application/json"
                            }, function (err, dataMeta) {
                                if (err) {
                                    callback(null, {
                                        statusCode: 406,
                                        body: JSON.stringify({
                                            message: 'Couldn\'t upload image',
                                            headers: { 'Content-Type': 'text/plain' },
                                            body: err.message || 'Incorrect id',

                                        })
                                    });
                                    return;
                                }
                                callback(null, {
                                    statusCode: 200,
                                    body: JSON.stringify(Object.assign(data, dataMeta))
                                });
                                return;
                            })

                        });
                    });


                })
                .catch(err => {
                    callback(null, {
                        statusCode: 406,
                        body: JSON.stringify({
                            message: 'Couldn\'t find user because of errors',
                            headers: { 'Content-Type': 'text/plain' },
                            body: err.message || 'Incorrect id',

                        })
                    });
                    return;
                })
        ));
    } catch (error) {
        callback(null, {
            statusCode: 406,
            body: JSON.stringify({
                message: 'Couldn\'t upload image because of errors',
                headers: { 'Content-Type': 'text/plain' },
                body: error.message || 'Incorrect id',

            })
        });
        return;
    }
}