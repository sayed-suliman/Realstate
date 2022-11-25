const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const validator = require("validator")
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    driver_license: {
        type: String,
        unique: true,
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
        type: Number
    },
    city: {
        type: String,
    },
    address: {
        type: String,
    },
    state: {
        type: String,
    },
    zip_code: {
        type: Number,
    },
    dob: {
        type: Date,
        default: ""
    },
    password: {
        type: String,
        minlength: [6, "the password should be greater than 6"],
        trim: true
    },
    role: {
        type: String,
        default: "student"
    },
    verified: {
        type: Boolean,
        default: false
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package"
    }
}, {
    timestamps: true
})
// find user to login
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error("Invalid Credentials")
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error("Invalid Credentials")
    }
    return user
}


userSchema.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject()
    delete userObj.password;
    return userObj
}

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