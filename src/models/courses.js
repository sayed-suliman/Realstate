const mongoose = require("mongoose")
const courseSchema = new mongoose.Schema({
    name: String,
    description: String,
    status: String,
    package: [{type:mongoose.Schema.Types.ObjectId,ref:'Package'}],
    price:{
        type:Number
    }
}, {
    timestamps: true
})
const Course = mongoose.model("Course", courseSchema)
module.exports = Course