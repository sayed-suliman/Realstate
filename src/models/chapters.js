const mongoose = require("mongoose")
const chapterSchema = mongoose.Schema({
    name:String,
    courseFile:String,
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    }
})
module.exports = mongoose.model("Chapter",chapterSchema)