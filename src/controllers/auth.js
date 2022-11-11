const { validationResult } = require("express-validator")
const User = require("./../models/users")
const Package = require("./../models/package")
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
        console.log(data)
        const formValidations = validationResult(req)
        if (formValidations.errors.length) {
            const errorObj = {}
            formValidations.errors.forEach(element => {
                errorObj[element.param] = element.msg
            });
            var package = await Package.findById(data.package)
            var { price, tax } = package;
            package.total = price * ((100 + tax) / 100)//total price with tax
            res.render("checkout", {
                title: "Checkout",
                data: [errorObj, package],
            })
        } else {
            console.log(data)
            // const user = await User(data).save()
            // if(user){
            return res.redirect('/verification')
            // }
        }
    } catch (e) {
        res.status(404).send({
            error: e.message
        })
    }
}

module.exports = { login, postLogin, signUp }