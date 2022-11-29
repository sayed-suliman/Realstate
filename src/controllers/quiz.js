const { encodeMsg, decodeMsg } = require("../helper/createMsg")
const Course = require("../models/courses")
const Quiz = require("../models/quiz")

const quizDetail = async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate("course")
        var msgToken = req.query.msg;
        var option = {}
        if (msgToken) {
            var msg = decodeMsg(msgToken)
            option = msg
        }
        res.render("dashboard/examples/quiz/quiz-detail", {
            title: "Dashboard | Detail Quiz",
            quizzes,
            toast: Object.keys(option).length == 0 ? undefined : option
        })
    } catch (e) {
        res.render("500", {
            err: e.message
        })
    }
}
const addQuiz = async (req, res) => {
    try {
        const courses = await Course.find({ status: 'publish' })
        var msgToken = req.query.msg;
        var option = {}
        if (msgToken) {
            var msg = decodeMsg(msgToken)
            option = msg
        }
        res.render("dashboard/examples/quiz/add-quiz", {
            title: "Dashboard | Add Quiz",
            courses,
            toast: Object.keys(option).length == 0 ? undefined : option
        })
    } catch (e) {
        res.render("500", {
            err: e.message
        })
    }
}

// post quiz 

const postQuiz = async (req, res) => {
    try {
        const fullQuiz = []
        const data = req.body
        const course = await Course.findOne({ name: data.course })
        const name = data.name
        delete data.name
        delete data.course
        const questions = Object.keys(data).length / 3
        for (let i = 1; i <= questions; i++) {
            fullQuiz.push(
                {
                    question: data[`question-${i}`],
                    options: data[`question-${i}-opt`],
                    ans: data[`question-${i}-ans`]
                }
            )
        }
        const quizAdded = await Quiz({
            course: course._id,
            name: name,
            questions: fullQuiz,
        }).save()
        if (quizAdded) {
            course.quizzes.push(quizAdded._id)
            await course.save()
            var msg = encodeMsg("Your Quiz has been added Successfully")
            res.redirect("/dashboard/add-quiz?msg=" + msg)
        }

    } catch (e) {
        res.json(404).json({
            msg: e.message,
            status: 404
        })
    }
}

// edit quiz

const editQuiz = async (req, res) => {
    try {
        let quizId = req.query.qId
        const quiz = await Quiz.findById(quizId).populate("course")
        const courses = await Course.find({ status: "publish" })
        res.render("dashboard/examples/quiz/quiz-edit", {
            courses,
            quiz,
            title: "Dashboard | Edit Quiz",
        })
    } catch (e) {
        res.render("500", {
            err: e.message
        })
    }
}

//updateQuizzes
const updateQuiz = async (req, res) => {
    try {
        const fullQuiz = []
        const data = req.body
        const qId = req.query.qId
        const quiz = await Quiz.findById(qId).populate("course")

        // before and after courses to remove id of quiz from old course and add to updated one
        const oldCourse = await Course.findOne({ name: quiz.course.name })
        // for index of quiz in course
        const oldCourseindex = oldCourse.quizzes.indexOf(qId)
        const afterCourse = await Course.findOne({ name: data.course })
        // for index of quiz in after course
        const afterCourseindex = afterCourse.quizzes.indexOf(qId)

        const name = data.name
        delete data.name
        delete data.course
        const questions = Object.keys(data).length / 3
        for (let i = 1; i <= questions; i++) {
            fullQuiz.push(
                {
                    question: data[`question-${i}`],
                    options: data[`question-${i}-opt`],
                    ans: data[`question-${i}-ans`]
                }
            )
        }
        await quiz.updateOne({
            questions: fullQuiz,
            name,
            course: afterCourse._id
        })
        if (!(oldCourse.name == afterCourse)) {
            if (oldCourseindex > -1) {
                oldCourse.quizzes.splice(oldCourseindex, 1)
                await oldCourse.save()
            }
            if (!(afterCourseindex > -1)) {
                afterCourse.quizzes.push(qId)
                await afterCourse.save()
            }
        }
        var msg = encodeMsg("Quiz Updated Successfully!")
        res.redirect("/dashboard/quiz-detail?msg=" + msg)
    } catch (e) {
        res.render("404",
            {
                err: e.message,
            }
        )
    }
}

module.exports = { quizDetail, addQuiz, postQuiz, editQuiz, updateQuiz }