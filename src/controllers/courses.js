const Package = require("../models/package")
const CourseModel = require("../models/courses")
const { encodeMsg } = require("../helper/createMsg");
const course = async (req, res) => {
    try {
        // all added packages
        const packages = await Package.find()
        res.render("dashboard/examples/add-course", { title: "Dashboard | Add Course", packages })
    } catch (e) {
        res.status(404).json({
            Error: e,
            Status: 404
        })
    }
}
// Add Course
const addcourse = async (req, res) => {
    try {
        const data = await req.body

        const package = await Package.findOne({ name: data.package })
        const addCourse = CourseModel({
            name: data.name,
            description: data.description,
            status: data.status,
            package: package._id

        })
        await addCourse.save()
        if (addCourse) {
            var msg = encodeMsg('The Course has been created')
            return res.redirect('/dashboard?msg=' + msg)
        }
        // req.flash("alert_success", "Course Added Successfully.!")
        // res.redirect('/dashboard')
    } catch (e) {
        var msg = encodeMsg('Some error while creating Course.', 'danger', '500')
        return res.redirect('/dashboard?msg=' + msg)
        // res.status(403).json({
        //     Error: e.message,
        //     Status: 403,
        //     msg: "Course Not Added"
        // })
    }
    // const courseAdded =await new AddCourse()
}

// course details
const courseDetails = async (req, res) => {
    try {
        const allCourses = await CourseModel.find()
        allCourses.forEach(async elm =>{
            await elm.populate('package',{name:1})
            console.log(elm)
        })

        res.render("dashboard/examples/course-detail", { title: "Dashboard | Course Detail", allCourses })
    } catch (e) {
        res.status(403).json({
            Error: e.message,
            Status: 403,
            msg: "Courses Not Find"
        })
    }
}
module.exports = { course, addcourse, courseDetails }