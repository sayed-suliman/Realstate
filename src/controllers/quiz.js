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

// post quiz 

const postQuiz = async(req,res)=>{
    try{
        const data = req.body
        res.json({
            msg:"success",
            data,
        })
    }catch(e){
        res.json(404).json({
            msg:e.message,
            status404
        })
    }
}
module.exports = {quizDetail,addQuiz,postQuiz}