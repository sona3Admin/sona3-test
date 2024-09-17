const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  auth: {
    user: process.env.SMTP_API_KEY,
    pass: process.env.SMTP_PASS_KEY
  }
});


exports.sendEmail = async (receivers, subject, text, html, lang) => {
  try {
    const recipientList = Array.isArray(receivers) ? receivers.join(', ') : receivers;

    const info = await transporter.sendMail({
      from: {
        address: 'support@sona3.ae',
        name: (!lang || lang == "en") ? "SONA3" : "صناع",
      },
      to: recipientList,
      subject: subject,
      text: text,
      html: html,
    });

    console.log('Email sent: %s', info.messageId);
    return { success: true, code: 201 };
  } catch (error) {
    console.log('Error sending email:', error);
    return { error: error.message, success: false, code: 500 };
  }
};
