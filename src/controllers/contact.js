const { encodeMsg, decodeMsg } = require("../helper/createMsg")
const Contact = require("../models/contact")

module.exports = {
    contactUs(req, res) {
        var msgToken = req.query.msg;
        var option = {}
        if (msgToken) {
            var msg = decodeMsg(msgToken)
            option = msg
        }
        res.render("dashboard/examples/contact-us", {
            title: "Dashboard | Contact-Us",
            toast: Object.keys(option).length == 0 ? undefined : option
        })
    },
    async postContact(req, res) {
        try {
            let user = res.locals.user
            let formData = req.body
            console.log("formdata",formData)
            const contactUs = await Contact({
                email: user.email,
                name: user.name,
                subject: formData.subject,
                message: formData.message
            }).save()
            if (contactUs) {
                var msg = encodeMsg("Message Sent Successfully.")
                res.redirect("/dashboard/contact-us?msg=" + msg)
            }

        } catch (e) {
            res.render("500", {
                err: e.message
            })
        }
    }
}