const { decodeMsg } = require("../helper/createMsg");
const User = require("../models/users");
module.exports = {
    async dashboard(req, res) {
        try {
            const students = await User.find({ role: "student" })
            const countStudents = await User.find({ role: "student" }).count()
            // 1,2,3 upto 12 used for months that are registered in this year
            const lastYear = new Date().getFullYear() - 1
            const currentYearstdData = {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
                6: 0,
                7: 0,
                8: 0,
                9: 0,
                10: 0,
                11: 0,
                12: 0
            }
            const lastYearStdObj = {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
                6: 0,
                7: 0,
                8: 0,
                9: 0,
                10: 0,
                11: 0,
                12: 0
            }
            var lastYearAllStds = 0
            var currentYearAllStds = 0

            students.forEach(std => {
                const month = std.createdAt.getMonth() + 1
                const stdYear = std.createdAt.getFullYear()
                if (stdYear === lastYear) {
                    lastYearStdObj[month] = lastYearStdObj[month] + 1
                    lastYearAllStds++
                }else{
                    currentYearstdData[month] = currentYearstdData[month] + 1
                    currentYearAllStds++
                }
            })
            // now find percentage of students here which year it growth or downfall
            const perNum = ((currentYearAllStds-lastYearAllStds)/lastYearAllStds)*100
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
                lastYearStdObj,
                currentYearstdData,
                countStudents,
                perNum
            })

        } catch (error) {
            console.log(error)
            res.redirect('/500')
        }
    }
}