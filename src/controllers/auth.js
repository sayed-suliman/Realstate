const { validationResult } = require("express-validator")
const User = require("./../models/users")
const Package = require("./../models/package")
const url = require('url')
const OTP = require('../models/otp')
const { generateCode } = require("../helper/genCode")
const { sendVerificationCode } = require("./mailServices")


const login = (req, res) => {
    console.log(req.session)
    res.render("login", {
        title: "Login"
    })
}
const postLogin = (req, res) => {
    res.redirect('/dashboard')
}

const signUp = async (req, res) => {
    try {
        const data = await req.body
        // selected package detail
        var package = await Package.findById(data.package)
        var { price, tax } = package;
        package.total = price * ((100 + tax) / 100)//total price with tax
        const formValidations = validationResult(req)
        if (formValidations.errors.length) {
            const errorObj = {}
            formValidations.errors.forEach(element => {
                errorObj[element.param] = element.msg
            });
            res.render("checkout", {
                title: "Checkout",
                err: errorObj,
                package
            })
        } else {
            console.log(data)
            const otpCode = generateCode();
            const user = await User(data).save()
            await OTP({
                email: data.email,
                otp: otpCode
            }).save();
            sendVerificationCode(data.email, otpCode)
            if (user) {
                console.log('user created')
                console.log(user._id)
                return res.redirect(url.format({
                    pathname: '/verification',
                    query: {
                        "user": user._id.toString()
                    }
                }))
            }
        }
    } catch (e) {
        res.status(404).send({
            error: e.message
        })
    }
}

module.exports = { login, postLogin, signUp }