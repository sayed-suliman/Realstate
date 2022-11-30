const { decodeMsg } = require("../helper/createMsg")
module.exports = {
    async dashboard(req, res) {
        try {
            var msgToken = req.query.msg;
            var msg = {}
            // not working
            if (res.locals.error.length > 0) {
                msg = decodeMsg(res.locals.error[0])
            }
            if (res.locals.success.length > 0) {
                msg = decodeMsg(res.locals.success[0])
            }
            //only used for payment
            if (msgToken) {
                msg = decodeMsg(msgToken)
            }

            if (req.user.role == 'student') {
                await req.user.populate({ path: 'package', populate: { path: 'courses' } })
                var userCourses = await req.user.package.courses
                return res.render("dashboard/new-dashboard", {
                    title: "Dashboard",
                    userCourses,
                    toast: Object.keys(msg).length == 0 ? undefined : msg,
                })
            }

            // by default is admin
            res.render("dashboard/new-dashboard", {
                title: "Dashboard",
                toast: Object.keys(msg).length == 0 ? undefined : msg,
            })

        } catch (error) {
            console.log(error)
            res.redirect('/500')
        }
    }
}