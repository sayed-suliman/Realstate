const Course = require("./../models/courses")
const { encodeMsg ,decodeMsg} = require("../helper/createMsg");
const Chapters = require("./../models/chapters")
// chpaters detail
const chapterDetail = async (req, res) => {
    // const allChaptersDetails = Chapters.find()
    const chapters = await Chapters.find().populate("course")
    res.render("dashboard/examples/chapter-details", {
        title: "Dashboard | Chapters Detail", chapters
    })
}

// addChapter get
const addChapter = async (req, res) => {
    try {
        var msgToken = req.query.msg;
        var option = {}
        if (msgToken) {
            var msg = decodeMsg(msgToken)
            option = msg
        }
        const courses = await Course.find()
        res.render("dashboard/examples/add-chapter", {
            courses,
            title: "Dashboard | Add Chapter",
            toast: Object.keys(option).length == 0 ? undefined : option 
        })
    } catch (e) {
        res.status(501).json({
            error: e.message
        })
    }
}
// add Chapter post
const postChapter = async (req, res) => {
    try {
        const data = await req.body
        const fileName = 'uploaded-media/' + req.file.filename
        console.log('file',req.file)
        const courseId = await Course.findOne({ name: data.course })
        console.log('Course', courseId)
        const chapterAdded = Chapters({
            name: data.name,
            fileName: req.file.originalname,
            path:fileName,
            course: courseId._id
        })
        await chapterAdded.save()
        var msg = encodeMsg("Your course has been added")
        return res.redirect('/dashboard/add-chapter?msg=' + msg)
        // const courses = await Courses.find()

        // res.render("dashboard/examples/add-chapter", {
        //     courses,
        //     title:"Dashboard | Add Course"
        // })
        // for post man
        // res.json({
        //     status:chapterAdded
        // })
    } catch (e) {
        var msg = encodeMsg("Your course has been added")
        return res.redirect('/dashboard?msg=' + msg)
        // postman
        // res.status(501).json({
        //     error: e.message
        // })
    }
}
const errorMsg = async (error, req, res, next) => {
    // var msg  = await encodeMsg(error.message,"danger",500)
    // res.redirect('/dashboard?msg=' + msg)
    // for postman
    res.status(404).json({
        err: error.message
    })
}


module.exports = { addChapter, chapterDetail, postChapter, errorMsg }