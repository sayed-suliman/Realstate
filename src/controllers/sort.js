const Courses = require("../models/courses")
const Chapter = require("./../models/chapters")
const Quiz = require("../models/quiz")
module.exports = {
    async order (req,res){
        const courses = await Courses.find()
        try{
           res.render("dashboard/examples/order/order",{
            title:'Dashboard | Order',
            courses
           })
        }catch (err) {
            res.render('500',{err})
        }
    },
    async orderCourse(req,res){
        try{
            const cId = req.params.id
            const course = await Courses.findById(cId).populate('chapters').populate("quizzes")
            const mergeContents = [
                ...course.quizzes,
                ...course.chapters
            ]
            const contents = mergeContents.sort((p1,p2)=>(p1.order>p2.order)?1:(p1.order<p2.order)?-1:0)
            res.render("dashboard/examples/order/order-course",{
             title:'Dashboard | Order-Course',
             contents,
             course
            })
         }catch (err) {
            console.log(err.message)
             res.render('500',{err:err.message})
         }
    },
    async sortData  (req, res){
        let contents = req.body
        const chapters = []
        const quizzes = []
        for (let content in contents) {
            if (contents[content].type === 'chapter') chapters.push(contents[content])
            if (contents[content].type === 'quiz' || contents[content].type === 'term') quizzes.push(contents[content])
        }
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