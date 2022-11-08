const Package = require("../models/package")
const CourseModel = require("../models/courses")
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

        const package = await Package.findOne({name:data.package})
        const addCourse = CourseModel({
            name: data.name,
            description: data.description,
            status: data.status,
            package: package._id
            
        })
        await addCourse.save()
        // req.flash("alert_success", "Course Added Successfully.!")
        res.redirect('/dashboard')
    } catch (e) {
        res.status(403).json({
            Error: e.message,
            Status: 403,
            msg: "Course Not Added"
        })
    }
    // const courseAdded =await new AddCourse()
}

// course details
const courseDetails = async (req, res) => {
    try {
        const allCourses = await CourseModel.find()
        res.render("dashboard/examples/course-detail", { title: "Dashboard | Course Detail", allCourses })
    } catch (e) {
        res.status(403).json({
            Error: e,
            Status: 403,
            msg: "Courses Not Find"
        })
    }
}
module.exports = { course, addcourse, courseDetails }