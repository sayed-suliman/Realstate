const nodemailer = require('nodemailer')
require('dotenv').config()
const hbs = require("nodemailer-express-handlebars")
var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.user,
        pass: process.env.pass
    }
})
transport.use('compile', hbs({
    viewEngine: {
        extname: ".hbs",
        layoutsDir: __dirname + "/templates/views/mail/",
        defaultLayout: false
    },
    extName: ".hbs",
    viewPath: "templates/views/mail/"
}))
module.exports = {
    async sendVerificationCode(email, code) {
        var send = await transport.sendMail({
            from: process.env.email,
            to: email,
            subject: "Verify your Account",
            text: `Verification Code: ${code}`,
            template: "otp",
            context: {
                code: code
            }
        })
        if (send) {
            console.log("sent")
            console.log(send)

        } else {
            console.log("failed send email")
        }
    }
}