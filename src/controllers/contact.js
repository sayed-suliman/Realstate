const { encodeMsg, decodeMsg } = require("../helper/createMsg")
const Message = require("../models/message")
const Setting = require('../models/setting')

module.exports = {
    async contactUs(req, res) {
        var msgToken = req.query.msg;
        var option = {}
        if (msgToken) {
            var msg = decodeMsg(msgToken)
            option = msg
        }
        const setting = await Setting.findOne()
        res.render("dashboard/examples/contact-us", {
            title: "Dashboard | Contact-Us",
            setting,
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
    },
    async readMessage(req, res) {
        try {
            if (req.params.id) {
                const Message = require('../models/message')
                const msg = await Message.findById(req.params.id)
                await msg.updateOne({ read: true })
                return res.render('dashboard/examples/read-msg', {
                    title: "Dashboard | Message",
                    msg
                })
            }
            return res.redirect('/dashboard')
        } catch (error) {
            const { encodeMsg } = require('../helper/createMsg')
            res.redirect('/dashboard?msg=' + encodeMsg(error.message, 'danger'))
        }
    }
}