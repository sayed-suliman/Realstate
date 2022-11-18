const { generateCode } = require("../helper/genCode");
const OTP = require("../models/otp");
const User = require("../models/users");
const { sendVerificationCode } = require("./mailServices");

module.exports = {
    async resendCode(req, res) {
        var { email } = req.query;
        if (email) {
            const otpCode = generateCode()
            sendVerificationCode(email, otpCode)
            const user = await User.findOne({ email });
            const code = await OTP.findOne({ email });

            // check whether otp exist or not
            code ? await code.updateOne({ otp: otpCode }) :
                await OTP({ email, otp: otpCode }).save()

            return res.render('verification', {
                title: "Verification",
                user,
                // sent is used to show the msg at view 
                sent: true
            })
        }
        return res.redirect('/')
    }
}