const nodemailer = require("nodemailer");
require("dotenv").config();
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const Setting = require("../models/setting");
module.exports = {
  async sendVerificationCode(email, code) {
    try {
      const setting = await Setting.findOne();
      const {
        mail: { user },
      } = setting;
      var transport = nodemailer.createTransport({
        host: setting?.mail.host || process.env.host,
        port: setting?.mail.port || process.env.mail_port,
        auth: {
          user: setting?.mail.user || process.env.user,
          pass: setting?.mail.pass || process.env.pass,
        },
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false,
        },
      });
      transport.use(
        "compile",
        hbs({
          viewEngine: {
            extname: ".hbs",
            layoutsDir: __dirname + "/templates/views/mail/",
            defaultLayout: false,
          },
          extName: ".hbs",
          viewPath: "templates/views/mail/",
        })
      );

      var send = await transport.sendMail({
        from: user || process.env.email,
        to: email,
        subject: "Verify your Account",
        text: `Verification Code: ${code}`,
        template: "otp",
        context: {
          code,
          url: `${process.env.SERVER_URI}`,
          site_name: setting.collegeName || process.env.SITE_NAME,
        },
      });
      if (send) {
        console.log("Verification email send.");
      } else {
        console.log("Error at verification mail.");
      }
    } catch (error) {
      console.log("Sending verification email failed." + error.message);
    }
  },
  async sendAgreement(email, username) {
    try {
      const setting = await Setting.findOne();
      const {
        mail: { user },
      } = setting;
      var transport = nodemailer.createTransport({
        host: setting?.mail.host || process.env.host,
        port: setting?.mail.port || process.env.mail_port,
        auth: {
          user: setting?.mail.user || process.env.user,
          pass: setting?.mail.pass || process.env.pass,
        },
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false,
        },
      });
      transport.use(
        "compile",
        hbs({
          viewEngine: {
            extname: ".hbs",
            layoutsDir: __dirname + "/templates/views/mail/",
            defaultLayout: false,
          },
          extName: ".hbs",
          viewPath: "templates/views/mail/",
        })
      );
      var send = await transport.sendMail({
        from: user || process.env.email,
        to: email,
        subject: "Your Agreement",
        text: `Your Agreement`,
        template: "otp",
        context: {
          username,
          agree: true,
          url: `${process.env.SERVER_URI}`,
          site_name: setting.collegeName || process.env.SITE_NAME,
        },
      });
      if (send) {
        console.log("Agreement mail send");
      } else {
        console.log("Agreement email failed");
      }
    } catch (error) {
      console.log("Sending agreement email failed.", error.message);
    }
  },
  async sendResetEmail(email, token) {
    try {
      var header_img = path.resolve(
        __dirname + "/public/images/email/animated_header.gif"
      );

      var url = `${process.env.SERVER_URI}/user/reset-password?token=${token}`;
      const setting = await Setting.findOne();
      const {
        mail: { user },
      } = setting;
      var transport = nodemailer.createTransport({
        host: setting?.mail.host || process.env.host,
        port: setting?.mail.port || process.env.mail_port,
        auth: {
          user: setting?.mail.user || process.env.user,
          pass: setting?.mail.pass || process.env.pass,
        },
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false,
        },
      });
      transport.use(
        "compile",
        hbs({
          viewEngine: {
            extname: ".hbs",
            layoutsDir: __dirname + "/templates/views/mail/",
            defaultLayout: false,
          },
          extName: ".hbs",
          viewPath: "templates/views/mail/",
        })
      );
      var send = await transport.sendMail({
        from: user || process.env.email,
        to: email,
        subject: `Reset Password of ${process.env.SITE_NAME}`,
        template: "reset-password",
        context: {
          url,
          header_img,
          site_name: setting.collegeName || process.env.SITE_NAME,
        },
      });
      if (send) {
        console.log(send);
      } else {
        console.log("failed sennd email");
      }
    } catch (error) {
      console.log(error);
      console.log("Error while send reset email");
    }
  },
  async welcomeEmail(email, data) {
    try {
      var formatDate = (date) => {
        if (date) {
          if (typeof date === "object") {
            let year = date.getFullYear();
            let month =
              date.getMonth() + 1 < 10
                ? `0${date.getMonth() + 1}`
                : date.getMonth() + 1;
            let day =
              date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
            return `${year}-${month}-${day}`;
          }
          if (typeof date === "string") return date;
        }
        return "";
      };
      data.orderDate = formatDate(data.orderDate);
      const setting = await Setting.findOne();
      data.siteName = setting.collegeName;
      const {
        mail: { user },
      } = setting;
      var transport = nodemailer.createTransport({
        host: setting?.mail.host || process.env.host,
        port: setting?.mail.port || process.env.mail_port,
        auth: {
          user: setting?.mail.user || process.env.user,
          pass: setting?.mail.pass || process.env.pass,
        },
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false,
        },
      });
      transport.use(
        "compile",
        hbs({
          viewEngine: {
            extname: ".hbs",
            layoutsDir: __dirname + "/templates/views/mail/",
            defaultLayout: false,
          },
          extName: ".hbs",
          viewPath: "templates/views/mail/",
        })
      );
      var send = await transport.sendMail({
        from: user || process.env.email,
        to: email,
        subject: `Welcome to ${setting.collegeName}`,
        template: "welcome",
        context: data,
      });
      if (send) {
        console.log("Welcome mail send successfully.");
      } else {
        console.log("Welcome mail sending failed.");
      }
    } catch (error) {
      console.log(error);
      console.log("Welcome email sending error");
    }
  },
};
