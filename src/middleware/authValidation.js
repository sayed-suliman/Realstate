const { check, validationResult } = require("express-validator")
const User = require("../models/users")
 const signUpMiddleware = [
    check('email').exists().isEmail().withMessage("This email doesn\'t exist").custom(async value => {
        const user = await User.findOne({ email: value }).then(user => {
            return user
        })
        if (user) {
            return Promise.reject("Email already in Use! Please Try Another")
        }
    }),
    check("personal_id").custom(async (value) => {
        const checkPersonalId = await User.findOne({ personal_id: value }).then(pId => {
            return pId
        })
        if (checkPersonalId) {
            return Promise.reject("Personal Id is Already in use")
        }
    }),
    check('password').custom(async (value,{req})=>{
        if(value !== req.body.c_password){
            return Promise.reject("Password not Matched !")
        }
    })
]
module.exports = signUpMiddleware