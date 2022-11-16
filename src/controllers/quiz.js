const quizDetail = (req,res)=>{
    res.render("dashboard/examples/quiz-detail")
}
const addQuiz = (req,res)=>{
    res.render("dashboard/examples/add-quiz")
}

module.exports = {quizDetail,addQuiz}