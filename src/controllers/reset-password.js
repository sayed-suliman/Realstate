const User = require("../models/users")

module.exports = {
    forgotPassword(req, res) {
        res.render('forgot-password', {
            title: "Forgot Password", reset: false
        })
    },
    async doForgotPassword(req, res) {
        const { email } = req.body
        var user = await User.findOne({ email })
        if (!user) {
            return res.render('forgot-password', {
                title: "Forgot Password",
                reset: false,
                msg: "No user found!",
                type:"danger"
            })
        }
    }
}