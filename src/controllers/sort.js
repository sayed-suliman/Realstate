const Courses = require("../models/courses")
const Chapter = require("./../models/chapters")
const Quiz = require("../models/quiz")
module.exports = {
    async sort (req,res){
        const courses = await Courses.find()
        try{
           res.render("dashboard/examples/sort/order",{
            title:'Dashboard | Sort',
            courses
           })
        }catch (err) {
            res.render('500',{err})
        }
    },
    async sortCourse(req,res){
        try{
            const cId = req.params.id
            const course = await Courses.findById(cId).populate('chapters').populate("quizzes")
            const mergeContents = [
                ...course.quizzes,
                ...course.chapters
            ]
            const contents = mergeContents.sort((p1,p2)=>(p1.order>p2.order)?1:(p1.order<p2.order)?-1:0)
            // console.log(course)
            res.render("dashboard/examples/sort/order-course",{
             title:'Dashboard | Sort-Course',
             contents,
             course
            })
         }catch (err) {
             res.render('500',{err:err.message})
         }
    },
    async sortData  (req, res){
        let contents = req.body
        const chapters = []
        const quizzes = []
        // console.log("contents",contents)
        for (let content in contents) {
            if (contents[content].type === 'chapter') chapters.push(contents[content])
            if (contents[content].type === 'quiz' || contents[content].type === 'final' || contents[content].type === 'mid') quizzes.push(contents[content])
        }
        // console.log("chapters", chapters)
        // console.log("quizzes", quizzes)
        chapters.forEach(async (chapter) => {
            const selectChapter = await Chapter.findById(chapter._id)
            selectChapter.order = chapter.order
            await selectChapter.save()
        })
        quizzes.forEach(async (quiz) => {
            const selectQuiz = await Quiz.findById(quiz._id)
            selectQuiz.order = quiz.order
            await selectQuiz.save()
        })
        res.send({
            msg: "Success"
        })
    }
}