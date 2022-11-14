const { default: mongoose } = require("mongoose");

const otpSchema = mongoose.Schema({
    email: String,
    otp: String,
    expireAt: {
        type: Date,
        default: Date.now,
        expires: 600//seconds
    }
}, {
    timestamps: true
})
const OPT = mongoose.model('OTP', otpSchema)
module.exports = OPT