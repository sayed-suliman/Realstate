const mongoose = require("mongoose")
const express = require("express")
const { check, validationResult } = require("express-validator")
const router = new express.Router()
const User = require("./../../models/users")
router.post("/register", [
    check('email').exists().isEmail().withMessage("This email doesn\'t exist").custom(async value => {
        const user = await User.findOne({ email: value }).then(user => {
            return user
        })
        if (user) {
            return Promise.reject("Username Already exist! Please Try Another")
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
    // check('')
], async (req, res) => {
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
        const formValidations = validationResult(req)
        const data = await req.body
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
})
module.exports = router