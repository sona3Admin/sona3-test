const nodemailer = require('nodemailer');
const { logInTestEnv } = require("../helpers/logger.helper");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_API_KEY,
    pass: process.env.SMTP_PASS_KEY
  }
});


exports.sendEmail = async (receivers, subject, text, html, lang, attachments) => {
  try {
    const recipientList = Array.isArray(receivers) ? receivers.join(', ') : receivers;
    logInTestEnv("recipientList", recipientList);
    const info = await transporter.sendMail({
      from: {
        address: 'support@sona3.ae',
        name: (!lang || lang == "en") ? "SONA3" : "صناع",
      },
      to: recipientList,
      subject: subject,
      text: text,
      html: html,
      attachments: attachments
    });

    logInTestEnv('Email sent: %s', info.messageId);
    return { success: true, code: 201 };
  } catch (error) {
    logInTestEnv('Error sending email:', error);
    return { error: error.message, success: false, code: 500 };
  }
};
