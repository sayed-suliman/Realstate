const mongoose = require("mongoose");
const Course = require("./courses")

const packageSchema = new mongoose.Schema({
    name: String,
    status: String,
    tax: Number,
    link:String,
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    price: Number,
    whoFor:Array
}, {
    timestamps: true
})
// packageSchema.pre("remove",async function(next){
//     const courses = await this
//     await Course.deleteMany({package:courses._id})
//     next()
// })
const Package = mongoose.model('Package', packageSchema)
module.exports = Package