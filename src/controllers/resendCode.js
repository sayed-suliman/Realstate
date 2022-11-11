const { generateCode } = require("../helper/genCode");
const OTP = require("../models/otp");
const Package = require("../models/package");
const { sendVerificationCode } = require("./mailServices");

module.exports = {
    async resendCode(req, res) {
        var { email, package: packageID } = req.query;
        if (email && packageID) {
            const otpCode = generateCode()
            const package = await Package.findById(packageID);
            sendVerificationCode(email, otpCode)
            const code = await OTP.findOne({ email });

            if (code) {
                // already exist otp updated
                await code.updateOne({ otp: otpCode });
                return res.render('verification', {
                    title: "Verification",
                    package, email, sent: true
                })

            } else {
                // new otp created
                await OTP({ email, otp: otpCode }).save()
                return res.render('verification', {
                    title: "Verification",
                    package, email, sent: true
                })
            }
        }
    }
}