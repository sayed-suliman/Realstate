const Package = require("../models/package")
const CourseModel = require("../models/courses")
const { encodeMsg, decodeMsg } = require("../helper/createMsg");
const course = async (req, res) => {
    try {
        // all added packages
        const packages = await Package.find({ status: "publish" })
        console.log(packages)
        res.render("dashboard/examples/courses/add-course", { title: "Dashboard | Add Course", packages })
    } catch (e) {
        // res.status(404).json({
        //     Error: e,
        //     Status: 404
        // })
        res.render("404")
    }
}
// Add Course or post
const addcourse = async (req, res) => {
    try {
        const data = await req.body
        // const 
        const package = await Package.find({ name: req.body.package }).select("_id")
        const addCourse = CourseModel({
            name: data.name,
            description: data.description,
            status: data.status,
            package: package,
            price: data.price
        })
        await addCourse.save()
        if(data.package){
            data.package.forEach(async element => {
                let packageCourse = await Package.findOne({name:element})
                let courseId = await CourseModel.find({ name: data.name }).select("_id")
                // packageCourse.courses.push(courseId)
                // await packageCourse.save()
                console.log(packageCourse.courses)
                console.log(courseId)
            });
        }
        if (addCourse) {
            var msg = encodeMsg('The Course has been created')
            return res.redirect('/dashboard?msg=' + msg)
        }
        // req.flash("alert_success", "Course Added Successfully.!")
        // res.redirect('/dashboard')
    } catch (e) {
        // var msg = encodeMsg('Some error while creating Course.', 'danger', '500')
        // return res.redirect('/dashboard?msg=' + msg)
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
        const allCourses = await CourseModel.find().populate('package')
        var msgToken = req.query.msg;
        var option = {}
        if (msgToken) {
            var msg = decodeMsg(msgToken)
            option = msg
        }
        res.render("dashboard/examples/courses/course-detail",
            {
                title: "Dashboard | Course Detail",
                allCourses,
                toast: Object.keys(option).length == 0 ? undefined : option
            })
    } catch (e) {
        // res.status(403).json({
        //     Error: e.message,
        //     Status: 403,
        //     msg: "Courses Not Find"
        // })
        res.render("404")
    }
}
// editCourse
const editCourse = async (req, res) => {
    try {
        let courseId = req.query.cId
        const course = await CourseModel.findById(courseId).populate("package")
        const packages = await Package.find({ status: "publish" })
        res.render("dashboard/examples/courses/course-edit",
            { title: "Dashboard | Edit Course", packages, course }
        )
    } catch (e) {
     res.render("500")
    }
}
// update course
// update
const updateCourse = async (req, res) => {
    try {
        const data = req.body
        const course = await CourseModel.findById(req.query.cId)
        const packageId = await Package.findOne({ name: data.package })
        await course.updateOne({
            name: data.name,
            description: data.description,
            status: data.status,
            package: packageId._id,
            price: data.price
        })
        var msg = encodeMsg("Course Updated")
        return res.redirect("/dashboard/course-detail?msg=" + msg)
    } catch (e) {
        res.render('404')
        // res.status(404).json({
        //     err: e.message,
        //     status: 404
        // })
    }
}



// delete Course
// Chapter Delete
const deleteCourse = async (req, res) => {
    try {
        const id = await req.query.cId
        const course = await CourseModel.findById(id)
        await course.remove()
        var msg = encodeMsg("Course Deleted", type = 'danger', status = 404)
        res.redirect("/dashboard/course-detail?msg=" + msg)
        // const chapterData = 
    } catch (e) {
        res.render("500.hbs")
    }
}
module.exports = { course, addcourse, courseDetails, deleteCourse, editCourse, updateCourse }