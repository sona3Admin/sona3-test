const { SendMailClient } = require("zeptomail");

exports.sendEmail = async (receiver, subject, text, html) => {
  const url = "api.zeptomail.com/";
  const token = "Zoho-enczapikey wSsVR60j+B+lCPx8zzysde4wylpcBln+QBh/3Qfw73T0HfjL9Mc8n0PKDQTySvQeGWZuE2MQpu8tnxkC22Vcj4t8zAwIXiiF9mqRe1U4J3x17qnvhDzNWmlUlhqOJYoLwgVqkmVmG8gh+g==";

  let client = new SendMailClient({ url, token });

  try {
    await client.sendMail({
      bounce_address: "password.reset@support.vipcardsshop.com",
      from: {
        address: "support@vipcardsshop.com",
        name: "SONA3",
      },
      to: [
        {
          email_address: {
            address: receiver,
          },
        },
      ],
      subject: subject,
      htmlbody: html,
      textbody: text,
    });

    console.log("Email sent successfully.");
    return { success: true, code: 201 };
  } catch (error) {
    console.log("Error sending email:", error);
    return { error: error, success: false, code: 500 };
  }
};
