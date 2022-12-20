const { check, validationResult } = require("express-validator")
const User = require("../models/users")
Date.prototype.getAge = function () {
    const date = new Date()
    const eighteen = date.getFullYear() - 18
    date.setUTCFullYear(eighteen)
    return date
}
const age = new Date()
const authMiddlewareUpdateByAdmin = [
    check("driver_license").custom(async (value) => {
        console.log('dd',value)
        const checkPersonalId = await User.findOne({ driver_license: value }).then(pId => {
            return pId
        })
        if (checkPersonalId) {
            return Promise.reject("Personal Id is Already in use")
        }
    }),
    check("dob").isBefore(age.getAge().toString()).withMessage("Your Entered an invalid date of birth. User must be 18+")
]
module.exports = authMiddlewareUpdateByAdmin