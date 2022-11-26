const Courses = require("./../models/courses")
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
    }
}