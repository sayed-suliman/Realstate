const Course = require("../models/courses")
const url = require('url');
const { encodeMsg } = require("../helper/createMsg");

module.exports = {
    async viewCourse(req, res) {
        try {
            const ID = req.params.id
            const course = await Course.findById(ID);
            if (course) {
                return res.render('dashboard/student/view-course', { title: "Course", course })
            }
            res.redirect('/dashboard')
        } catch (err) {
            console.log(err.message)
            if (err.message.includes('ObjectId failed')) {
                return res.redirect(url.format({
                    pathname: '/dashboard',
                    query: {
                        msg: encodeMsg("Course Id doesn't exist.", 'danger')
                    }
                }))

            }
            res.redirect(url.format({
                pathname: '/dashboard',
                query: {
                    msg: encodeMsg(err.message, 'danger')
                }
            }))
        }
    }
}