const { check, validationResult } = require("express-validator")
const User = require("../models/users")
 const addUserByAdminMiddleware = [
    check('email').exists().isEmail().withMessage("Please enter a valid email.").custom(async value => {
        const user = await User.findOne({ email: value }).then(user => {
            return user
        })
        if (user) {
            return Promise.reject("Email already in Use! Please Try Another")
        }
    }),
    check("driver_license").custom(async (value) => {
        const checkPersonalId = await User.findOne({ driver_license: value }).then(pId => {
            return pId
        })
        if (checkPersonalId) {
            return Promise.reject("Personal Id is Already in use")
        }
    }),
]
module.exports = addUserByAdminMiddleware