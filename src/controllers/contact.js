const { encodeMsg, decodeMsg } = require("../helper/createMsg")
const Message = require("../models/message")

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
            const contactUs = await Message({
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
    },
    // at admin panel
    async messages(req, res) {
        const messages = await Message.find();
        messages.sort((a, b) => {
            return (a == b) ? 0 : a ? -1 : 1
        })
        res.render('dashboard/examples/message', {
            title: "Dashboard | Message",
            messages
        })
    }
}