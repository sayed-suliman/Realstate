const nodemailer = require('nodemailer')
require('dotenv').config()
var transport = nodemailer.createTransport({
    secure: true,
    service: 'gmail',
    auth: {
        user: process.env.email,
        pass: process.env.emailPass
    }
})
module.exports = {
    async sendVerificationCode(email, code) {
        var send = await transport.sendMail({
            from: process.env.email,
            to: email,
            subject: "Verify your Account",
            text: `Verification Code: ${code}`
        })
        if (send) {
            console.log(send)
        } else {
            console.log("failed send email")
        }
    }
}