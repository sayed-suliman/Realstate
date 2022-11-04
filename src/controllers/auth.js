const { validationResult } = require("express-validator")
const User = require("./../models/users")
const login =  (req,res)=>{
    res.render("login",{
        title:"Login"
    })
}
const postLogin = async (req, res) => {
    try {
        const user = await User.findByCrediantials(req.body.email, req.body.password)
        res.redirect("/dashboard")
    } catch (e) {
        res.render("login", {
            title:"Login",
            invalid_crediatials: e.message
        })
    }
}


const signUp = async (req, res) => {
    //     const err = validationResult(req)
    //     const errorObj = {}
    //   err.errors.forEach(element => {
    //     errorObj[element.param] = element.msg
    //     });
    //     if (err.errors.length) {
    //         return res.send({
    //             Error:errorObj
    //         })
    //     }
    //     res.send(req.body)
    try {
        const data = await req.body
        const formValidations = validationResult(req)
        console.log("form validations" , formValidations)
        // if (data.password != data.c_password) {
        //     throw new Error("Password not matched")
        // }
        if (formValidations.errors.length) {
            const errorObj = {}
            formValidations.errors.forEach(element => {
                errorObj[element.param] = element.msg
            });
            console.log("if is true",errorObj)
            res.render("login", {
                title:"Login",
                err: errorObj,
            })
        } else {
            console.log("else")
            const user =await User(data)
            await user.save()
            res.redirect("/login")
        }

        // res.send({ abc: user })

        // res.redirect("/login")
    } catch (e) {
        res.status(404).send({
            error: e.message
        })
    }
}






module.exports = {login,postLogin,signUp}