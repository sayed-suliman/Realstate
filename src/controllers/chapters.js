const express = require("express")
const Courses = require("./../models/courses")
const Chapters = require("./../models/chapters")
// chpaters detail
const chapterDetail = async(req,res)=>{
    const chapters = await Chapters.find()
    res.render("dashboard/examples/chapter-details",{
        title:"Dashboard | Course Detail"
    })
}




// addChapter get
const addChapter = async (req, res) => {
    try {
        const courses = await Courses.find()
        res.render("dashboard/examples/add-chapter", {
            courses,
            title:"Dashboard | Add Course"
        })
    }catch (e) {
        res.status(501).json({
            error:e.message
        })
    }
}
// add Chapter post
const postChapter = async (req, res) => {
    try {
        const data = await req.body
        const fileName = 'uploaded-media/'+req.file.originalname
        console.log(data.course)
        const chapterAdded = Chapters({
            name:data.name,
            courseFile:fileName,
            course:data.course
        })
        await chapterAdded.save()
        res.json({
            status:chapterAdded
        })
        // const courses = await Courses.find()
        // res.render("dashboard/examples/add-chapter", {
        //     courses,
        //     title:"Dashboard | Add Course"
        // })
    }catch (e) {
        res.status(501).json({
            error:e.message
        })
    }
}


module.exports = { addChapter,chapterDetail,postChapter}