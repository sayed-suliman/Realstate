const mongoose = require("mongoose")
const chapterSchema = mongoose.Schema({
    name:String,
    fileName:String,
    path:String,
    type:{
        type:String,
        default:"chapter"
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    },
    order:{
        type:Number
    }
})
module.exports = mongoose.model("Chapter",chapterSchema)