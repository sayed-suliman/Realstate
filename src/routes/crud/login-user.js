const express = require("express")
const router = new express.Router()
const User = require('./../../models/users')
router.post("/login", async (req, res) => {
    try {
        const user = await User.findByCrediantials(req.body.email, req.body.password)
        res.redirect("/dashboard")
    } catch (e) {
        res.render("login", {
            title:"Login",
            invalid_crediatials: e.message
        })
    }
})

module.exports = router