const Package = require("../models/package")
const CourseModel = require("../models/courses")
const { encodeMsg, decodeMsg } = require("../helper/createMsg");
const url = require('url');
const course = async (req, res) => {
    try {
        // all added packages
        const packages = await Package.find({ status: "publish" })
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
        if (addCourse) {
            if (data.package) {
                if (Array.isArray(data.package)) {
                    data.package.forEach(async element => {
                        let packageCourse = await Package.findOne({ name: element })
                        let courseId = await CourseModel.findOne({ name: data.name }).select("_id")
                        packageCourse.courses = packageCourse.courses.concat(courseId)
                        await packageCourse.save()
                        // packageCourse.courses.push(courseId)
                        // await packageCourse.save()
                        return;
                    });
                } else {
                    // console.log(data.package)
                    // console.log(package)
                    let packageCourse = await Package.findOne({ name: data.package })
                    let courseId = await CourseModel.findOne({ name: data.name }).select("_id")
                    //     // packageCourse.courses.push(courseId)
                    //     // await packageCourse.save()
                    packageCourse.courses = packageCourse.courses.concat(courseId)
                    await packageCourse.save()
                }
            }
            var msg = encodeMsg('The Course has been created')
            return res.redirect('/dashboard?msg=' + msg)
        }
        // req.flash("alert_success", "Course Added Successfully.!")
        // res.redirect('/dashboard')
    } catch (e) {
        var msg = encodeMsg('Some error while creating Course.', 'danger', '500')
        return res.redirect('/dashboard?msg=' + msg)

        // testing purpose
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
        res.status(403).json({
            Error: e.message,
            Status: 403,
            msg: "Courses Not Find"
        })
        // res.render("404")
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
        const cId = req.query.cId
        const course = await CourseModel.findById(req.query.cId)
        const packages = await Package.find({ name: req.body.package }).select("_id")
        const packageId = await Package.findOne({ name: data.package })
        const allPackages = await Package.find()


        await course.updateOne({
            ...data,
            package: packages,
        })
        if (course) {
            if (!data.package) {
                allPackages.forEach(async (onePackage) => {
                    const index = onePackage.courses.indexOf(cId)
                    onePackage.courses.splice(index, 1)
                    await onePackage.save()
                })
            }
            if (data.package) {
                if (Array.isArray(data.package)) {
                    allPackages.forEach(async (pk) => {
                        const index = pk.courses.indexOf(cId)
                        let isPackageContain = data.package.includes(pk.name)
                        if (isPackageContain) {
                            if (!(index > -1)) {
                                pk.courses = pk.courses.concat(cId)
                            }
                        } else {
                            if (index > -1) {
                                pk.courses.splice(index, 1)
                            }
                        }
                        await pk.save()
                    })
                } else {
                    allPackages.forEach(async (eachPackage) => {
                        if (eachPackage.name === data.package) {
                            let courseIndex = eachPackage.courses.indexOf(cId)
                            if (!(courseIndex > -1)) {
                                eachPackage.courses = eachPackage.courses.concat(cId)
                                await eachPackage.save()
                            }
                            return;
                        } else {
                            let courseIndex = eachPackage.courses.indexOf(cId)
                            if (courseIndex > -1) {
                                eachPackage.courses.splice(courseIndex, 1)
                                await eachPackage.save()
                            }
                        }
                    })
                }
            }
            var msg = encodeMsg("Course Updated")
            return res.redirect("/dashboard/course-detail?msg=" + msg)
        }


    } catch (e) {
        // res.render('404')

        // testing purpose
        res.status(404).json({
            err: e.message,
            status: 404
        })
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

// Student all courses
var allCourses = async (req, res) => {
    try {
        await req.user.populate({ path: 'package', populate: { path: 'courses' } })
        var userCourses = await req.user.package.courses
        res.render("dashboard/examples/courses/course-detail",
            {
                title: "Dashboard | All Courses",
                userCourses,
            })
    } catch (e) {
        res.status(403).json({
            Error: e.message,
            Status: 403,
            msg: "Courses Not Find"
        })
        // res.render("404")
    }
}
//for the student view
var viewCourse = async (req, res) => {
    try {
        const ID = req.params.id
        const course = await CourseModel.findById(ID).populate('chapters').populate('quizzes')
        if (course) {
            // sorting the chapter by name 
            const contents = [...course.quizzes, ...course.chapters]
            contents.sort((a, b) => {
                if (a.order < b.order) { return -1; }
                if (a.order > b.order) { return 1; }
                return 0;
            })
            // unlock the first content of the current chapter
            contents[0].status = contents[0].status == 0 ? 1 : contents[0].status
            contents[1].status = contents[0].status == 0 ? 1 : contents[0].status
            return res.render('dashboard/student/view-course', { title: `Course | ${course.name}`, title: course.name, contents })
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
module.exports = { course, addcourse, courseDetails, deleteCourse, editCourse, updateCourse, allCourses, viewCourse }