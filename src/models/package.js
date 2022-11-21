const mongoose = require("mongoose");
const Course = require("./courses")

const packageSchema = new mongoose.Schema({
    name: String,
    description: String,
    status: String,
    tax: Number,
    price: Number
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