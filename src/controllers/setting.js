const { encodeMsg } = require("../helper/createMsg")

module.exports = {
    settingView(req, res) {
        res.render("dashboard/examples/setting", {
            title: "Dashboard | Setting"
        })
    },
    async doSetting(req, res) {
        console.log('test')
        res.send(req.body)
    },
    settingError(error, req, res, next) {
        var msg = encodeMsg(error.message, "danger", 500)
        res.redirect('/dashboard/setting')
        console.log(req.body)
        // res.status(404).json({ error: error.message })
    }
}