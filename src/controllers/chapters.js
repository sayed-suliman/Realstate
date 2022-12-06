const Course = require("./../models/courses")
const { encodeMsg, decodeMsg } = require("../helper/createMsg");
const Chapters = require("./../models/chapters")
const fs = require("fs");
const userMeta = require("../models/user-meta");
// chpaters detail
const chapterDetail = async (req, res) => {
    // const allChaptersDetails = Chapters.find()
    var msgToken = req.query.msg;
    var option = {}
    if (msgToken) {
        var msg = decodeMsg(msgToken)
        option = msg
    }
    const chapters = await Chapters.find().populate("course")
    res.render("dashboard/examples/chapter/chapter-details", {
        title: "Dashboard | Chapters Detail",
        chapters,
        toast: Object.keys(option).length == 0 ? undefined : option
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
        const courses = await Course.find({ status: "publish" })
        res.render("dashboard/examples/chapter/add-chapter", {
            courses,
            title: "Dashboard | Add Chapter",
            toast: Object.keys(option).length == 0 ? undefined : option
        })
    } catch (e) {
        res.status(501).json({
            status: 501,
            error: e.message
        })
    }
}
// add Chapter post
const postChapter = async (req, res) => {
    try {
        const data = await req.body
        const fileName = 'uploaded-media/' + req.file.filename
        const courseId = await Course.findOne({ name: data.course })
        const chapterAdded = Chapters({
            name: data.name,
            fileName: req.file.originalname,
            path: fileName,
            course: courseId._id
        })
        await chapterAdded.save()
        if (chapterAdded) {
            courseId.chapters.push(chapterAdded._id)
            await courseId.save()
        }

        var msg = encodeMsg("Your Chapter has been added")
        return res.redirect('/dashboard?msg=' + msg)

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

// Chapter Delete
const deleteChapter = async (req, res) => {
    try {
        const id = await req.query.cId
        const chapter = await Chapters.findById(id)
        await chapter.remove()
        fs.unlink("public/" + chapter.path, (err, data) => {
        })
        var msg = encodeMsg("Chapter Deleted", type = 'danger', status = 404)
        res.redirect("/dashboard/chapter-detail?msg=" + msg)
        // const chapterData = 
    } catch (e) {
        res.render("500.hbs")
    }
}
// edit chapter
const editChapter = async (req, res) => {
    try {
        let chapterId = req.query.cId
        const chapter = await Chapters.findById(chapterId).populate("course")
        const courses = await Course.find({ status: "publish" })
        res.render("dashboard/examples/chapter/chapter-edit", {
            courses,
            chapter,
            title: "Dashboard | Edit Chapter",
        })
    } catch (e) {
        res.status(503).json({
            msg: e.message,
            status: 503
        })
    }
}
// update
const updateChapter = async (req, res) => {
    try {
        const data = req.body
        const cId = req.query.cId
        const chapter = await Chapters.findById(cId)
        const beforeCoure = await Course.findById(chapter.course)
        const courseId = await Course.findOne({ name: data.course })
        let beforeindex = beforeCoure.chapters.indexOf(cId)
        let afterindex = courseId.chapters.indexOf(cId)
        // if we have file than do this operation 
        if (req.file) {
            const filePath = 'uploaded-media/' + req.file.filename
            const oldPath = chapter.path
            await chapter.updateOne({
                name: req.body.name,
                course: courseId._id,
                fileName: req.file.originalname,
                path: filePath,
            })
            fs.unlink("public/" + oldPath, (err, data) => {
                console.log("delte", err, data)
            })
            if (!(afterindex > -1)) {
                courseId.chapters.push(cId)
                await courseId.save()
            }
            if (!(beforeCoure._id.toString() == courseId._id.toString())) {
                if (beforeindex > -1) {
                    beforeCoure.chapters.splice(beforeindex, 1)
                    await beforeCoure.save()
                }
            }
            var msg = encodeMsg("Chapter Updated")
            return res.redirect("/dashboard/chapter-detail?msg=" + msg)
        }
        // if the file is not selected then do this operation
        await chapter.updateOne({
            name: req.body.name,
            course: courseId._id,
        })
        if (!(afterindex > -1)) {
            courseId.chapters.push(cId)
            await courseId.save()
        }
        if (!(beforeCoure._id.toString() == courseId._id.toString())) {
            if (beforeindex > -1) {
                beforeCoure.chapters.splice(beforeindex, 1)
                await beforeCoure.save()
            }
        }
        var msg = encodeMsg("Chapter Updated")
        res.redirect("/dashboard/chapter-detail?msg=" + msg)
    } catch (e) {
        res.status(404).json({
            err: e.message,
            status: 404
        })
    }
}

// for student view
const viewChapter = async (req, res) => {
    const ID = req.params.id
    const chapter = await Chapters.findById(ID).lean();
    const completedChap = await userMeta.findOne({ user_id: req.user._id, chapter_id: chapter._id })
    if (completedChap) {
        chapter.completed = true
    }
    console.log(chapter)
    res.render('dashboard/student/view-chapter', { title: `Chapter | ${chapter.name}`, chapter })
}
const markAsCompleted = async (req, res) => {
    try {
        const { id: chapterId } = req.body
        const chapter = await Chapters.findById(chapterId)
        if (chapter) {
            const alreadyCompleted = await userMeta.findOne({ chapter_id: chapter._id, user_id: req.user._id })
            if (!alreadyCompleted) {
                await userMeta({
                    user_id: req.user._id,
                    chapter_id: chapter._id,
                    meta_key: 'completed',
                    meta_value: 'true'
                }).save()
                return res.send({ success: 'completed' })
            } else {
                return res.send({ error: 'already completed' })
            }
        }
        console.log(chapterId)
        return res.send({ error: "Chapter not found" })
    } catch (error) {
        res.send({ error: error.message })
    }
}


// error msg
const errorMsg = async (error, req, res, next) => {
    var msg = await encodeMsg(error.message, "danger", 500)
    res.redirect('/dashboard/add-chapter?msg=' + msg)
    // for postman
    // res.status(404).json({
    //     err: error.message
    // })
}


module.exports = { addChapter, chapterDetail, postChapter, errorMsg, deleteChapter, editChapter, updateChapter, viewChapter, markAsCompleted }