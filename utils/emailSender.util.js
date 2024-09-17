const nodemailer = require('nodemailer');

// Replace with your SMTP configuration
const transporter = nodemailer.createTransport({
  host: "smtp.zeptomail.com",
  port: 587,
  auth: {
    user: "emailapikey",
    pass: "wSsVR610+hLwXfsrnGGqJ7xpzVtSBg6iR0t52QOp43KvGa3L8sdtw0DKVgHyHPdKRGI/HDZG8L8rnRwJhmJc2owrmFkBWSiF9mqRe1U4J3x17qnvhDzIX21VkBuNKI0AwgRpmWNgFcEl+g=="
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
