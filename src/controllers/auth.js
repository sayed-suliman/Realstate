const { validationResult } = require("express-validator")
const User = require("./../models/users")
const login = (req, res) => {
    res.render("login", {
        title: "Login"
    })
}
const postLogin = async (req, res) => {
    res.redirect('/dashboard')
}

const signUp = async (req, res) => {
    try {
        const data = await req.body
        const formValidations = validationResult(req)
        if (formValidations.errors.length) {
            const errorObj = {}
            formValidations.errors.forEach(element => {
                errorObj[element.param] = element.msg
            });
            res.render("login", {
                title: "Login",
                err: errorObj,
            })
        } else {
            const user = await User(data)
            await user.save()
            req.login(user, (error) => {
                if (error) { return next(error) }
                return res.redirect('/dashboard')
            })
        }
    } catch (e) {
        res.status(404).send({
            error: e.message
        })
    }
}

module.exports = { login, postLogin, signUp }