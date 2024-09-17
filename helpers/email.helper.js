const { sendEmail } = require("../utils/emailSender.util");

exports.sendEmailVerificationCode = async (receiverObject, lang) => {
    try {
        // Generate a random 6-digit OTP code
        const otpCode = generateRandomOTPCode();

        // Set the language (default to English)
        lang = !lang || lang === "en" ? "en" : "ar";

        // Define content based on the language
        const content = {
            en: {
                subject: "Verify Your Sona3 Account",
                greeting: `Hello ${receiverObject?.name || receiverObject?.userName},`,
                message: `Thank you for registering with our service. To complete your registration, please use the following verification code:`,
                bestRegards: "Best regards,",
                team: "SONA3 Team",
                ignore: "If you didn't request this code, please ignore this email.",
            },
            ar: {
                subject: "تأكيد حسابك على صناع",
                greeting: `مرحبًا ${receiverObject?.name || receiverObject?.userName},`,
                message: `شكرًا لتسجيلك في خدمتنا. لإكمال التسجيل، يرجى استخدام رمز التحقق التالي:`,
                bestRegards: "مع أطيب التحيات،",
                team: "فريق صناع",
                ignore: "إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.",
            },
        };

        // Use the selected language content
        const selectedContent = content[lang];

        // Construct the HTML version of the email
        const htmlContent = `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${selectedContent.subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #000; direction: ${lang === "ar" ? "rtl" : "ltr"}; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #88050d; color: #fff; text-align: center; padding: 10px; }
          .content { background-color: #dfb678; padding: 20px; color: #000; }
          .code { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; color: #88050d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${selectedContent.subject}</h1>
          </div>
          <div class="content">
            <p>${selectedContent.greeting}</p>
            <p>${selectedContent.message}</p>
            <div class="code">${otpCode}</div>
            <p>${selectedContent.ignore}</p>
            <p>${selectedContent.bestRegards}<br>${selectedContent.team}</p>
          </div>
        </div>
      </body>
      </html>
    `;

        // Construct the plain text version of the email
        const textContent = `
      ${selectedContent.greeting}

      ${selectedContent.message}

      ${otpCode}

      ${selectedContent.ignore}

      ${selectedContent.bestRegards}
      ${selectedContent.team}
    `;

        // Send the email using the utility function
        const emailResult = await sendEmail(
            receiverObject.email,
            selectedContent.subject,
            textContent,
            htmlContent,
            lang // Pass the lang parameter for the email "from" name
        );

        if (emailResult.success) {
            console.log("Email Sent Successfully...");
            return {
                success: true,
                code: 200,
                result: otpCode,
            };
        } else {
            throw new Error("Failed to send verification email");
        }
    } catch (err) {
        console.error("Error in sendEmailVerificationCode:", err.message);
        return {
            success: false,
            code: 500,
            error: "Failed to send verification code",
        };
    }
};

const generateRandomOTPCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};
