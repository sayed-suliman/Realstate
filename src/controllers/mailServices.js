const nodemailer = require('nodemailer')
require('dotenv').config()
const hbs = require("nodemailer-express-handlebars")
const path = require('path')

var transport = nodemailer.createTransport({
    host: process.env.host,
    port: process.env.mail_port,
    auth: {
        user: process.env.user,
        pass: process.env.pass
    }, tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    },
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
        try {
            var send = await transport.sendMail({
                from: process.env.email,
                to: email,
                subject: "Verify your Account",
                text: `Verification Code: ${code}`,
                template: "otp",
                context: {
                    code,
                    url: `${process.env.SERVER_URI}`,
                    site_name: process.env.SITE_NAME
                }
            })
            if (send) {
                console.log("sent")
                console.log(send)

            } else {
                console.log("failed send email")
            }
        } catch (error) {
            console.log('Sending verification email failed.')
        }
    },
    async sendResetEmail(email, token) {
        try {
            var header_img = path.resolve(__dirname + '/public/images/email/animated_header.gif')
            var url = `${process.env.SERVER_URI}/user/reset-password?token=${token}`;
            console.log(url)
            var send = await transport.sendMail({
                from: process.env.email,
                to: email,
                subject: `Reset Password of ${process.env.SITE_NAME}`,
                template: 'reset-password',
                context: { url, header_img, site_name: process.env.SITE_NAME }
            })
            if (send) {
                console.log(send)
            } else {
                console.log("failed sennd email")
            }
        } catch (error) {
            console.log(error)
            console.log('Error while send reset email')
        }
    }
}