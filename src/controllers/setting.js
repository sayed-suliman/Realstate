const { encodeMsg, decodeMsg } = require("../helper/createMsg")

module.exports = {
    settingView(req, res) {
        var msgToken = req.query.msg;
        var msg = {}
        if (msgToken) {
            msg = decodeMsg(msgToken)
        }
        res.render("dashboard/examples/setting", {
            title: "Dashboard | Setting",
            toast: Object.keys(msg).length == 0 ? undefined : msg,
        })
    },
    async doSetting(req, res) {
        try {
            console.log('test')
            res.send(req.body)
        } catch (error) {
            res.send(error.message)
        }
    },
    settingError(error, req, res, next) {
        console.log(error.message)
        var msg = encodeMsg(error.message, "danger", 500)
        res.redirect('/dashboard/setting?msg=' + msg)
        // res.status(404).json({ error: error.message })
    }
}