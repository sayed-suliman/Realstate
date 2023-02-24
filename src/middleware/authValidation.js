const { check, validationResult } = require("express-validator")
const User = require("../models/users")
const signUpMiddleware = [
    check('email').exists().isEmail().withMessage("Please enter a valid email.").custom(async value => {
        const user = await User.findOne({ email: value, verified: true }).then(user => {
            return user
        })
        if (user) {
            return Promise.reject("Email already in Use! Please Try Another")
        }
    }).custom(async value => {
        // if the user already exist but not verified
        const user = await User.findOne({ email: value, verified: false }).then(user => {
            return user
        })
        // user already exist but not verified
        if (user) {
            return Promise.reject("redirect to verification," + user._id.toString())
        }
    }),
    // check("personal_id").custom(async (value) => {
    //     const checkPersonalId = await User.findOne({ personal_id: value }).then(pId => {
    //         return pId
    //     })
    //     if (checkPersonalId) {
    //         return Promise.reject("Personal Id is Already in use")
    //     }
    // }),
    check('password').custom(async (value, { req }) => {
        if (value !== req.body.c_password) {
            return Promise.reject("Password not Matched !")
        }
    })
]
module.exports = signUpMiddleware