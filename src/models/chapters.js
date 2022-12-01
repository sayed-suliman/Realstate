const mongoose = require("mongoose")
const chapterSchema = mongoose.Schema({
    name: String,
    fileName: String,
    path: String,
    type: {
        type: String,
        default: "chapter"
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    order: {
        type: Number
    },
    status: {
        type: Number,
        default: 0
    }
})
module.exports = mongoose.model("Chapter", chapterSchema)