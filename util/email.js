const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, html, text) => {
  try {
      nodemailer.createTransport({
        host: process.env.HOST,
        service: process.env.SERVICE,
        port: 465,
        secure: true,
        auth: {
          user: data.USER_EMAIL,
          pass: data.PASS_EMAIL,
        },
      }).sendMail({
        from: 'Il Decimo <noreply@ildecimo.it>',
        to: email,
        subject: subject,
        html: html,
        text: text,
      });
  } catch (error) {
    console.log("email not sent");
    console.log(error);
  }
};

module.exports = sendEmail;