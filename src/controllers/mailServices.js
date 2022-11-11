const nodemailer = require('nodemailer')
require('dotenv').config()
var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.user,
        pass: process.env.pass
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