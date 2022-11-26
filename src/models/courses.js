const mongoose = require("mongoose")
const courseSchema = new mongoose.Schema({
    name: String,
    description: String,
    status: String,
    progress:{
        type:Number,
        default:0,
    },
    package: [{type:mongoose.Schema.Types.ObjectId,ref:'Package'}],
    price:{
        type:Number
    },
    chapter:[{type:mongoose.Schema.Types.ObjectId,ref:'Chapter'}]
}, {
    timestamps: true
})
const Course = mongoose.model("Course", courseSchema)
module.exports = Course