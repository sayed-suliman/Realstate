const {checkSchema} = require('express-validator');
const User = require('../models/users');

const freeLessonValidation = checkSchema({
    firstName: {
        trim: true,
        escape: true,
        notEmpty: true,
        errorMessage: 'Field is invalid or Empty'
    },
    lastName: {
        trim: true,
        escape: true,
        notEmpty: true,
        errorMessage: 'Field is invalid or Empty'
    },
    email: {
        isEmail: true,
        normalizeEmail: true,
        custom: {
            options: async value=>{
                return await User.find({email: value}).then(user=>{
                    if(user.length > 0){
                        return Promise.reject('Email already in use');
                    }
                })
            }
        }
    },
    lessonType: {
        notEmpty: true,
        isString: true
    },
    password: {
        notEmpty: true,
        isLength: {
            options: {
                min: 6
            },
            errorMessage: 'Password must be at least 6 character'
        }
    },
    cPassword: {
        notEmpty: true,
        custom: {
            options: async (value, {req})=>{
                if(value !== req.body.password){
                    throw new Error('Password not matched!');
                }
            }
        }
    }
})

module.exports = freeLessonValidation;