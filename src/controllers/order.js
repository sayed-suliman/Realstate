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
    },
    async orderCourse(req,res){
        try{
            const cId = req.params.id
            const course = await Courses.findById(cId).populate('contents')
            console.log(course)
            res.render("dashboard/examples/order/order-course",{
             title:'Dashboard | Order-Course',
             course,

            })
         }catch (err) {
            console.log(err.message)
             res.render('500',{err:err.message})
         }
    }
}