const mongoose = require("mongoose")
const courseSchema = new mongoose.Schema({
    name: String,
    description: String,
    status: String,
    package: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Package'
    }
}, {
    timestamps: true
})
const Course = mongoose.model("Course", courseSchema)
module.exports = Course