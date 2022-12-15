const { decodeMsg, encodeMsg } = require("../helper/createMsg");
const Order = require("../models/order");
const User = require("../models/users");
const url = require('url');
const userMeta = require("../models/user-meta");
const Result = require('../models/result');
const Course = require("../models/courses");
module.exports = {
    async dashboard(req, res) {
        try {
            var msgToken = req.query.msg;
            var msg = {}
            // // not working
            // if (res.locals.error.length > 0) {
            //     msg = decodeMsg(res.locals.error[0])
            // }
            // if (res.locals.success.length > 0) {
            //     msg = decodeMsg(res.locals.success[0])
            // }
            //only used for payment
            if (msgToken) {
                msg = decodeMsg(msgToken)
            }

            if (req.user.role == 'student') {
                await req.user.populate({ path: 'package', populate: { path: 'courses',match:{status:"publish"} } })
                var userCourses = await req.user.package.courses
                var completedCourses = {}
                let progress = {};
                for await (let content of userCourses) {
                    // used for to find the content(chap+quiz) length 
                    let total = 0;
                    for await (let chapter of content.chapters) {
                        const completedChap = await userMeta.findOne({ chapter_id: chapter.toString(), user_id: req.user._id.toString(), meta_key: "completed" })
                        if (completedChap) {
                            if (progress[content.name]) {
                                progress[content.name]++
                            } else {
                                progress[content.name] = 1
                            }

                        }
                        total++
                    }
                    for await (let quiz of content.quizzes) {
                        const takenQuiz = await Result.findOne({ user: req.user._id, quiz: quiz.toString() })
                        if (takenQuiz) {
                            if (progress[content.name]) {
                                progress[content.name]++
                            } else {
                                progress[content.name] = 1
                            }
                        }
                        total++
                    }
                    if (progress[content.name]) {
                        const value = Math.floor((progress[content.name] / total) * 100);
                        progress[content.name] = value
                        if (value == 100) {
                            completedCourses[content.name] = content._id.toString()
                        }
                    }
                }
                for await (let [index, content] of userCourses.entries()) {
                    if (completedCourses[content.name]) {
                        userCourses.splice(index, 1)
                    }
                }
                completedCourses = Object.keys(completedCourses).length ? completedCourses : undefined
                return res.render("dashboard/new-dashboard", {
                    title: "Dashboard",
                    userCourses,
                    completedCourses,
                    progress,
                    toast: Object.keys(msg).length == 0 ? undefined : msg,
                })
            }
            // regulator part start

            if (req.user.role == 'regulator') {
                var userCourses = await Course.find({ status: 'publish' })
                return res.render("dashboard/new-dashboard", {
                    title: "Dashboard",
                    userCourses,
                    toast: Object.keys(msg).length == 0 ? undefined : msg,
                })
            }

            // regulator part end

            const students = await User.find({ role: "student" })
            const countStudents = await User.find({ role: "student" }).count()
            const orders = await Order.find()
            var allSale = 0
            // 1,2,3 upto 12 used for months that are registered in this year
            const lastYear = new Date().getFullYear() - 1
            const currentYear = new Date().getFullYear()

            // this portion is for students registration this year and last year
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
                let month = std.createdAt.getMonth() + 1
                const stdYear = std.createdAt.getFullYear()
                if (stdYear === lastYear) {
                    lastYearStdObj[month] = lastYearStdObj[month] + 1
                    lastYearAllStds++
                }
                if (stdYear === currentYear) {
                    currentYearstdData[month] = currentYearstdData[month] + 1
                    currentYearAllStds++
                }
            })
            // now find percentage of students here which year it growth or downfall
            const perNum = Math.round(((currentYearAllStds - lastYearAllStds) / lastYearAllStds) * 100)
            // End of student data portion


            // now sum of amounts of all months in this year and in the last year
            var lastYearAllAmounts = 0
            var currentYearAllAmounts = 0
            const currentYearAmount = {
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
            const lastYearAmount = {
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
            orders.forEach((order) => {
                let month = order.createdAt.getMonth() + 1
                const orderYear = order.createdAt.getFullYear()
                if (orderYear === lastYear) {
                    lastYearAmount[month] += order.amount
                    lastYearAllAmounts += order.amount
                }
                if (currentYear === orderYear) {
                    currentYearAmount[month] += order.amount
                    currentYearAllAmounts += order.amount
                }
                allSale += order.amount
            })
            const percentageAmount = Math.round(((currentYearAllAmounts - lastYearAllAmounts) / lastYearAllAmounts) * 100)

            // end of amounts portions
            // by default is admin
            res.render("dashboard/new-dashboard", {
                title: "Dashboard",
                toast: Object.keys(msg).length == 0 ? undefined : msg,
                lastYearStdObj,
                currentYearstdData,
                countStudents,
                perNum,
                allSale,
                lastYearAmount,
                currentYearAmount,
                percentageAmount,
                currentYearAllAmounts,
                lastYearAllAmounts
            })

        } catch (error) {
            console.log(error.message)
            res.redirect(url.format({
                pathname: '/dashboard',
                query: {
                    msg: encodeMsg(error.message, 'danger')
                }
            }))
        }
    }
}