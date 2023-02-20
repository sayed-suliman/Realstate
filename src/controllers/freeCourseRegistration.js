module.exports = {
    register : async (req, res)=>{
        try {
            res.render('freeCourse-register',{
                title: 'Free Lesson'
            }) 
        } catch (error) {
            console.log(error.message)
            res.status(500).redirect('/500');
        }

    }
}