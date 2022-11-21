const quizDetail = (req,res)=>{
    res.render("dashboard/examples/quiz/quiz-detail",{
        title:"Dashboard | Detail Quiz"
    })
}
const addQuiz = (req,res)=>{
    res.render("dashboard/examples/quiz/add-quiz",{
        title:"Dashboard | Add Quiz"
    })
}

module.exports = {quizDetail,addQuiz}