const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const validator = require("validator")
const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    personal_id: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Your Email is not Correct")
            }
        },
    },
    phone: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zip_code: {
        type: Number,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    password: {
        type: String,
        minlength: [6, "the password should be greater than 6"],
        trim: true
    }
})

// hashed password
userSchema.pre("save", async function (next) {
    const user = this
    if (user.isModified("password")) {
        const hash = await bcrypt.hash(user.password, 10)
        user.password = hash
    }
    next()
})

const User = mongoose.model("User", userSchema)
module.exports = User