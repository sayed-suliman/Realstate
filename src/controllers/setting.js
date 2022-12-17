const { encodeMsg, decodeMsg } = require("../helper/createMsg")
const Setting = require('../models/setting')

module.exports = {
    async settingView(req, res) {
        var msgToken = req.query.msg;
        var msg = {}
        if (msgToken) {
            msg = decodeMsg(msgToken)
        }
        res.render("dashboard/examples/setting", {
            title: "Dashboard | Setting",
            toast: Object.keys(msg).length == 0 ? undefined : msg,
            setting: await Setting.findOne()
        })
    },
    async doSetting(req, res) {
        try {
            const {
                name,
                address,
                phone,
                quizMarks,
                midRetake,
                finalRetake,
                quizPolicy,
                reviewQuiz,
                id
            } = req.body
            const settingData = {
                collegeName: name,
                collegeAddress: address,
                collegePhone: phone,
                passingMark: quizMarks,
                midRetake,
                finalRetake,
                quizPolicy,
                reviewQuiz: !!reviewQuiz
            }
            if (req.file) {
                settingData.logoPath = req.file.filename
            }
            const setting = id ? await Setting.findByIdAndUpdate(id, settingData)
                : await Setting(settingData).save()
            if (setting) {
                var msg = encodeMsg(`Setting successfully ${id ? `updated.` : 'saved.'}`)
                return res.redirect('/dashboard/setting?msg=' + msg)
            }
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