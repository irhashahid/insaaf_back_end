const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,   // the gmail
    pass: process.env.MAIL_PASS,   // the gmail app password
  },
});

module.exports = transporter;