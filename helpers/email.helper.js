const { sendEmail } = require("../utils/emailSender.util");


exports.sendEmailVerificationCode = async (receiverObject, lang, emailType) => {
  try {
    const otpCode = generateRandomOTPCode();
    lang = !lang || lang === "en" ? "en" : "ar";

    const content = {
      en: {
        verifyEmail: {
          subject: "Verify Your Sona3 Account",
          greeting: `Hello ${receiverObject?.name || receiverObject?.userName},`,
          message: `Thank you for registering with our service. To complete your registration, please use the following verification code:`,
          bestRegards: "Best regards,",
          team: "SONA3 Team",
          ignore: "If you didn't request this code, please ignore this email.",
        },
        resetPassword: {
          subject: "Reset Your Sona3 Account Password",
          greeting: `Hello ${receiverObject?.name || receiverObject?.userName},`,
          message: `We received a request to reset your Sona3 account password. To proceed with the password reset, please use the following code:`,
          bestRegards: "Best regards,",
          team: "SONA3 Team",
          ignore: "If you didn't request a password reset, please ignore this email and ensure your account is secure.",
        }
      },
      ar: {
        verifyEmail: {
          subject: "تأكيد حسابك على صناع",
          greeting: `مرحبًا ${receiverObject?.name || receiverObject?.userName},`,
          message: `شكرًا لتسجيلك في خدمتنا. لإكمال التسجيل، يرجى استخدام رمز التحقق التالي:`,
          bestRegards: "مع أطيب التحيات،",
          team: "فريق صناع",
          ignore: "إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.",
        },
        resetPassword: {
          subject: "إعادة تعيين كلمة المرور لحسابك على صناع",
          greeting: `مرحبًا ${receiverObject?.name || receiverObject?.userName},`,
          message: `لقد تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك على صناع. للمتابعة مع إعادة تعيين كلمة المرور، يرجى استخدام الرمز التالي:`,
          bestRegards: "مع أطيب التحيات،",
          team: "فريق صناع",
          ignore: "إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني والتأكد من أمان حسابك.",
        }
      },
    };

    const type = emailType === "resetPassword" ? "resetPassword" : "verifyEmail";
    const selectedContent = content[lang][type];

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
          .content { background-color: #dfb678; padding: 20px; color: black; }
          .code { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; color: #fff; }
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
      console.error("Failed to send verification email");
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


exports.sendSellerVerificationConfirmation = async (receiverObject, lang) => {
  try {
    lang = !lang || lang === "en" ? "en" : "ar";

    const content = {
      en: {
        subject: "Your Sona3 Seller Account is Now Verified",
        greeting: `Hello ${receiverObject?.userName},`,
        message: "Congratulations! Your Sona3 seller account has been verified successfully.",
        support: "If you need any assistance, our seller support team is here to help.",
        bestRegards: "Best regards,",
        team: "SONA3 Team"
      },
      ar: {
        subject: "تم التحقق من حساب البائع الخاص بك على صناع",
        greeting: `مرحبًا ${receiverObject?.name || receiverObject?.userName},`,
        message: "تهانينا! تم التحقق من حساب البائع الخاص بك على صناع بنجاح.",
        support: "إذا كنت بحاجة إلى أي مساعدة، فريق دعم البائعين موجود هنا للمساعدة.",
        bestRegards: "مع أطيب التحيات،",
        team: "فريق صناع"
      }
    };

    const selectedContent = content[lang];

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${selectedContent.subject}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            direction: ${lang === "ar" ? "rtl" : "ltr"}; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background-color: #88050d; 
            color: #fff; 
            text-align: center; 
            padding: 20px; 
            border-radius: 5px 5px 0 0; 
          }
          .content { 
            background-color: #fff; 
            padding: 30px; 
            border: 1px solid #dfb678;
            border-radius: 0 0 5px 5px;
          }
          .steps {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .steps ul {
            margin: 10px 0;
            padding-${lang === "ar" ? "right" : "left"}: 20px;
          }
          .support {
            background-color: #dfb678;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            color: #333;
          }
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
            
            <div class="support">
              <p>${selectedContent.support}</p>
            </div>

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

      ${selectedContent.support}

      ${selectedContent.bestRegards}
      ${selectedContent.team}
    `;

    // Send the email using the utility function
    const emailResult = await sendEmail(
      receiverObject.email,
      selectedContent.subject,
      textContent,
      htmlContent,
      lang
    );

    if (emailResult.success) {
      console.log("Verification confirmation email sent successfully...");
      return {
        success: true,
        code: 200,
        message: "Verification confirmation email sent successfully"
      };
    } else {
      console.error("Failed to send verification confirmation email");
    }
  } catch (err) {
    console.error("Error in sendSellerVerificationConfirmation:", err.message);
    return {
      success: false,
      code: 500,
      error: "Failed to send verification confirmation email"
    };
  }
};


exports.sendShopVerificationConfirmation = async (receiverObject, lang) => {
  try {
    lang = !lang || lang === "en" ? "en" : "ar";

    const content = {
      en: {
        subject: "Your Sona3 Shop is Now Verified",
        greeting: `Hello ${receiverObject?.userName},`,
        message: "Congratulations! Your Sona3 Shop has been verified successfully. You can now start adding items to your inventory and begin selling on our platform.",
        support: "If you need any assistance, our seller support team is here to help.",
        bestRegards: "Best regards,",
        team: "SONA3 Team"
      },
      ar: {
        subject: "تم التحقق من المتجر الخاص بك على صناع",
        greeting: `مرحبًا ${receiverObject?.userName},`,
        message: "تهانينا! تم التحقق من المتجر الخاص بك على صناع بنجاح. يمكنك الآن البدء في إضافة المنتجات إلى مخزونك والبدء في البيع على منصتنا.",
        support: "إذا كنت بحاجة إلى أي مساعدة، فريق دعم البائعين موجود هنا للمساعدة.",
        bestRegards: "مع أطيب التحيات،",
        team: "فريق صناع"
      }
    };

    const selectedContent = content[lang];

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${selectedContent.subject}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            direction: ${lang === "ar" ? "rtl" : "ltr"}; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background-color: #88050d; 
            color: #fff; 
            text-align: center; 
            padding: 20px; 
            border-radius: 5px 5px 0 0; 
          }
          .content { 
            background-color: #fff; 
            padding: 30px; 
            border: 1px solid #dfb678;
            border-radius: 0 0 5px 5px;
          }
          .steps {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .steps ul {
            margin: 10px 0;
            padding-${lang === "ar" ? "right" : "left"}: 20px;
          }
          .support {
            background-color: #dfb678;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            color: #333;
          }
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
            
            <div class="support">
              <p>${selectedContent.support}</p>
            </div>

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

      ${selectedContent.support}

      ${selectedContent.bestRegards}
      ${selectedContent.team}
    `;

    // Send the email using the utility function
    const emailResult = await sendEmail(
      receiverObject.email,
      selectedContent.subject,
      textContent,
      htmlContent,
      lang
    );

    if (emailResult.success) {
      console.log("Verification confirmation email sent successfully...");
      return {
        success: true,
        code: 200,
        message: "Verification confirmation email sent successfully"
      };
    } else {
      console.error("Failed to send verification confirmation email");
    }
  } catch (err) {
    console.error("Error in sendSellerVerificationConfirmation:", err.message);
    return {
      success: false,
      code: 500,
      error: "Failed to send verification confirmation email"
    };
  }
};


exports.sendServiceRequestCreationEmailToCustomer = async (serviceRequest, lang) => {
  try {
    lang = !lang || lang === "en" ? "en" : "ar";

    const content = {
      en: {
        subject: "Service Request Confirmation",
        greeting: `Hello ${serviceRequest.customer.name},`,
        message: `Thank you for placing a service request at "${serviceRequest.shop.nameEn}". Below are the details of your request:`,
        details: `
          <ul>
            <li><strong>Request ID:</strong> ${serviceRequest._id}</li>
            <li><strong>Shop Name:</strong> ${serviceRequest.shop.nameEn}</li>
            <li><strong>Request Status:</strong> ${serviceRequest.status}</li>
            <li><strong>Service:</strong> ${serviceRequest.service.nameEn}</li>
            <li><strong>Service Description:</strong> ${serviceRequest.service.descriptionEn}</li>
            <li><strong>Service Base Price:</strong> AED${serviceRequest.service.basePrice}</li>
            <li><strong>Request Notes:</strong> ${serviceRequest.requestNotes || "N/A"}</li>
          </ul>
        `,
        bestRegards: "Best regards,",
        team: "SONA3 Team"
      },
      ar: {
        subject: "تأكيد طلب الخدمة",
        greeting: `مرحبًا ${serviceRequest.customer.name},`,
        message: `شكرًا لقيامك بإجراء طلب خدمة في "${serviceRequest.shop.nameAr}". إليك تفاصيل طلبك:`,
        details: `
          <ul>
            <li><strong>رقم الطلب:</strong> ${serviceRequest._id}</li>
            <li><strong>اسم المتجر:</strong> ${serviceRequest.shop.nameAr}</li>
            <li><strong>حالة الطلب:</strong> ${serviceRequest.status}</li>
            <li><strong>الخدمة:</strong> ${serviceRequest.service.nameAr}</li>
            <li><strong>وصف الخدمة:</strong> ${serviceRequest.service.descriptionAr}</li>
            <li><strong>السعر المبدئي الخدمة:</strong> درهم اماراتي${serviceRequest.service.basePrice}</li>
            <li><strong>ملاحظات الطلب:</strong> ${serviceRequest.requestNotes || "لا يوجد"}</li>
          </ul>
        `,
        bestRegards: "مع أطيب التحيات،",
        team: "فريق صناع"
      }
    };

    const selectedContent = content[lang];

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${selectedContent.subject}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            direction: ${lang === "ar" ? "rtl" : "ltr"}; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background-color: #88050d; 
            color: #fff; 
            text-align: center; 
            padding: 20px; 
            border-radius: 5px 5px 0 0; 
          }
          .content { 
            background-color: #fff; 
            padding: 30px; 
            border: 1px solid #dfb678;
            border-radius: 0 0 5px 5px;
          }
          ul { margin: 10px 0; padding-${lang === "ar" ? "right" : "left"}: 20px; }
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
            ${selectedContent.details}
            <p>${selectedContent.bestRegards}<br>${selectedContent.team}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      ${selectedContent.greeting}

      ${selectedContent.message}

      Request Details:
      - Request ID: ${serviceRequest._id}
      - Shop Name: ${serviceRequest.shop.nameEn}
      - Request Status: ${serviceRequest.status}
      - Service: ${serviceRequest.service.nameEn}
      - Service Description: ${serviceRequest.service.descriptionEn}
      - Service Base Price: $${serviceRequest.service.basePrice}
      - Request Notes: ${serviceRequest.requestNotes || "N/A"}

      ${selectedContent.bestRegards}
      ${selectedContent.team}
    `;
    console.log("serviceRequest.customer.email", serviceRequest.customer.email)
    const emailResult = await sendEmail(
      serviceRequest.customer.email,
      selectedContent.subject,
      textContent,
      htmlContent,
      lang
    );

    return emailResult.success
      ? { success: true, code: 200, message: "Customer email sent successfully" }
      : { success: false, code: 500, error: "Failed to send customer email" };
  } catch (err) {
    console.error("Error in sendCustomerServiceRequestConfirmation:", err.message);
    return { success: false, code: 500, error: "Failed to send customer email" };
  }
};


exports.sendPurchaseConfirmationEmailToCustomer = async (purchaseDetails, lang) => {
  try {
    lang = !lang || lang === "en" ? "en" : "ar";
    purchaseDetails["paymentEn"] = purchaseDetails.paymentMethod == "cashOnDelivery" ? "Cash On Delivery" : "Visa"
    purchaseDetails["paymentAr"] = purchaseDetails.paymentMethod == "cashOnDelivery" ? "الدفع عند التوصيل" : "فيزا"
    const content = {
      en: {
        subject: "Purchase Confirmation",
        greeting: `Hello ${purchaseDetails.customer.name},`,
        message: `Thank you for your purchase from "${purchaseDetails.shop.nameEn}". Below are the details of your order:`,
        details: `
          <ul>
            <li><strong>Order ID:</strong> ${purchaseDetails._id}</li>
            <li><strong>Shop Name:</strong> ${purchaseDetails.shop.nameEn}</li>
            <li><strong>Order Status:</strong> Purchased</li>
            <li><strong>Service:</strong> ${purchaseDetails.service.nameEn}</li>
            <li><strong>Service Description:</strong> ${purchaseDetails.service.descriptionEn}</li>
            <li><strong>Service Base Price:</strong> AED${purchaseDetails.service.basePrice}</li>
            <li><strong>Service Total:</strong> AED${purchaseDetails.serviceTotal}</li>
            <li><strong>Order Total:</strong> AED${purchaseDetails.orderTotal}</li>
            <li><strong>Taxes:</strong> ${purchaseDetails.taxesRate}% (AED${purchaseDetails.taxesTotal})</li>
            <li><strong>Payment Method:</strong> ${purchaseDetails.paymentEn}</li>
            <li><strong>Notes:</strong> ${purchaseDetails.requestNotes || "N/A"}</li>
          </ul>
        `,
        bestRegards: "Best regards,",
        team: "SONA3 Team",
      },
      ar: {
        subject: "تأكيد الشراء",
        greeting: `مرحبًا ${purchaseDetails.customer.name},`,
        message: `شكرًا لقيامك بالشراء من "${purchaseDetails.shop.nameAr}". إليك تفاصيل طلبك:`,
        details: `
          <ul>
            <li><strong>رقم الطلب:</strong> ${purchaseDetails._id}</li>
            <li><strong>اسم المتجر:</strong> ${purchaseDetails.shop.nameAr}</li>
            <li><strong>حالة الطلب:</strong> ${purchaseDetails.status}</li>
            <li><strong>الخدمة:</strong> ${purchaseDetails.service.nameAr}</li>
            <li><strong>وصف الخدمة:</strong> ${purchaseDetails.service.descriptionAr}</li>
            <li><strong>السعر الأساسي:</strong> درهم إماراتي${purchaseDetails.service.basePrice}</li>
            <li><strong>إجمالي الخدمة:</strong> درهم إماراتي${purchaseDetails.serviceTotal}</li>
            <li><strong>إجمالي الطلب:</strong> درهم إماراتي${purchaseDetails.orderTotal}</li>
            <li><strong>الضرائب:</strong> ${purchaseDetails.taxesRate}% (درهم إماراتي${purchaseDetails.taxesTotal})</li>
            <li><strong>طريقة الدفع:</strong> ${purchaseDetails.paymentAr}</li>
            <li><strong>ملاحظات:</strong> ${purchaseDetails.requestNotes || "لا يوجد"}</li>
          </ul>
        `,
        bestRegards: "مع أطيب التحيات،",
        team: "فريق صناع",
      },
    };

    const selectedContent = content[lang];

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${selectedContent.subject}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            direction: ${lang === "ar" ? "rtl" : "ltr"}; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background-color: #88050d; 
            color: #fff; 
            text-align: center; 
            padding: 20px; 
            border-radius: 5px 5px 0 0; 
          }
          .content { 
            background-color: #fff; 
            padding: 30px; 
            border: 1px solid #d4d4d4;
            border-radius: 0 0 5px 5px;
          }
          ul { margin: 10px 0; padding-${lang === "ar" ? "right" : "left"}: 20px; }
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
            ${selectedContent.details}
            <p>${selectedContent.bestRegards}<br>${selectedContent.team}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      ${selectedContent.greeting}

      ${selectedContent.message}

      Order Details:
      - Order ID: ${purchaseDetails._id}
      - Shop Name: ${purchaseDetails.shop.nameEn}
      - Order Status: ${purchaseDetails.status}
      - Service: ${purchaseDetails.service.nameEn}
      - Service Description: ${purchaseDetails.service.descriptionEn}
      - Service Base Price: AED${purchaseDetails.service.basePrice}
      - Order Total: AED${purchaseDetails.orderTotal}
      - Taxes: ${purchaseDetails.taxesRate}% (AED${purchaseDetails.taxesTotal})
      - Payment Method: ${purchaseDetails.paymentMethod}
      - Notes: ${purchaseDetails.requestNotes || "N/A"}

      ${selectedContent.bestRegards}
      ${selectedContent.team}
    `;

    const emailResult = await sendEmail(
      purchaseDetails.customer.email,
      selectedContent.subject,
      textContent,
      htmlContent,
      lang
    );

    return emailResult.success
      ? { success: true, code: 200, message: "Purchase confirmation email sent successfully" }
      : { success: false, code: 500, error: "Failed to send purchase confirmation email" };
  } catch (err) {
    console.error("Error in sendPurchaseConfirmationEmailToCustomer:", err.message);
    return { success: false, code: 500, error: "Failed to send purchase confirmation email" };
  }
};


exports.sendServiceRequestCreationEmailToSeller = async (serviceRequest, lang) => {
  try {
    lang = !lang || lang === "en" ? "en" : "ar";

    const content = {
      en: {
        subject: "New Service Request Notification",
        greeting: `Hello ${serviceRequest.seller.userName},`,
        message: `A new service request has been placed for your shop "${serviceRequest.shop.nameEn}" by ${serviceRequest.customer.name}. Below are the details of the request:`,
        details: `
          <ul>
            <li><strong>Request ID:</strong> ${serviceRequest._id}</li>
            <li><strong>Customer Name:</strong> ${serviceRequest.customer.name}</li>
            <li><strong>Customer Email:</strong> ${serviceRequest.customer.email}</li>
            <li><strong>Customer Phone:</strong> ${serviceRequest.customer.phone}</li>
            <li><strong>Service:</strong> ${serviceRequest.service.nameEn}</li>
            <li><strong>Service Description:</strong> ${serviceRequest.service.descriptionEn}</li>
            <li><strong>Request Notes:</strong> ${serviceRequest.requestNotes || "N/A"}</li>
          </ul>
        `,
        bestRegards: "Best regards,",
        team: "SONA3 Team"
      },
      ar: {
        subject: "إشعار طلب خدمة جديد",
        greeting: `مرحبًا ${serviceRequest.seller.userName},`,
        message: `تم تقديم طلب خدمة جديد لمتجرك "${serviceRequest.shop.nameAr}" من قبل ${serviceRequest.customer.name}. فيما يلي تفاصيل الطلب:`,
        details: `
          <ul>
            <li><strong>رقم الطلب:</strong> ${serviceRequest._id}</li>
            <li><strong>اسم العميل:</strong> ${serviceRequest.customer.name}</li>
            <li><strong>البريد الإلكتروني للعميل:</strong> ${serviceRequest.customer.email}</li>
            <li><strong>هاتف العميل:</strong> ${serviceRequest.customer.phone}</li>
            <li><strong>الخدمة:</strong> ${serviceRequest.service.nameAr}</li>
            <li><strong>وصف الخدمة:</strong> ${serviceRequest.service.descriptionAr}</li>
            <li><strong>ملاحظات الطلب:</strong> ${serviceRequest.requestNotes || "لا يوجد"}</li>
          </ul>
        `,
        bestRegards: "مع أطيب التحيات،",
        team: "فريق صناع"
      }
    };

    const selectedContent = content[lang];

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${selectedContent.subject}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            direction: ${lang === "ar" ? "rtl" : "ltr"}; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background-color: #88050d; 
            color: #fff; 
            text-align: center; 
            padding: 20px; 
            border-radius: 5px 5px 0 0; 
          }
          .content { 
            background-color: #fff; 
            padding: 30px; 
            border: 1px solid #dfb678;
            border-radius: 0 0 5px 5px;
          }
          ul { margin: 10px 0; padding-${lang === "ar" ? "right" : "left"}: 20px; }
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
            ${selectedContent.details}
            <p>${selectedContent.bestRegards}<br>${selectedContent.team}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      ${selectedContent.greeting}

      ${selectedContent.message}

      Request Details:
      - Request ID: ${serviceRequest._id}
      - Customer Name: ${serviceRequest.customer.name}
      - Customer Email: ${serviceRequest.customer.email}
      - Customer Phone: ${serviceRequest.customer.phone}
      - Service: ${serviceRequest.service.nameEn}
      - Service Description: ${serviceRequest.service.descriptionEn}
      - Request Notes: ${serviceRequest.requestNotes || "N/A"}

      ${selectedContent.bestRegards}
      ${selectedContent.team}
    `;

    console.log("serviceRequest.seller.email", serviceRequest.seller.email);
    const emailResult = await sendEmail(
      serviceRequest.seller.email,
      selectedContent.subject,
      textContent,
      htmlContent,
      lang
    );

    return emailResult.success
      ? { success: true, code: 200, message: "Seller email sent successfully" }
      : { success: false, code: 500, error: "Failed to send seller email" };
  } catch (err) {
    console.error("Error in sendServiceRequestNotificationToSeller:", err.message);
    return { success: false, code: 500, error: "Failed to send seller email" };
  }
};


exports.sendPurchaseConfirmationEmailToSeller = async (purchaseDetails, lang) => {
  try {
    lang = !lang || lang === "en" ? "en" : "ar";
    purchaseDetails["paymentEn"] = purchaseDetails.paymentMethod == "cashOnDelivery" ? "Cash On Delivery" : "Visa"
    purchaseDetails["paymentAr"] = purchaseDetails.paymentMethod == "cashOnDelivery" ? "الدفع عند التوصيل" : "فيزا"
    const content = {
      en: {
        subject: "New Purchase Notification",
        greeting: `Hello ${purchaseDetails.seller.userName},`,
        message: `A new service request has been purchased from your shop "${purchaseDetails.shop.nameEn}". Below are the details of the purchase:`,
        details: `
          <ul>
            <li><strong>Order ID:</strong> ${purchaseDetails._id}</li>
            <li><strong>Customer Name:</strong> ${purchaseDetails.customer.name}</li>
            <li><strong>Customer Phone:</strong> ${purchaseDetails.customer.phone}</li>
            <li><strong>Shop Name:</strong> ${purchaseDetails.shop.nameEn}</li>
            <li><strong>Service:</strong> ${purchaseDetails.service.nameEn}</li>
            <li><strong>Service Description:</strong> ${purchaseDetails.service.descriptionEn}</li>
            <li><strong>Service Base Price:</strong> AED${purchaseDetails.service.basePrice}</li>
            <li><strong>Service Total:</strong> AED${purchaseDetails.serviceTotal}</li>
            <li><strong>Order Total:</strong> AED${purchaseDetails.orderTotal}</li>
            <li><strong>Taxes:</strong> ${purchaseDetails.taxesRate}% (AED${purchaseDetails.taxesTotal})</li>
            <li><strong>Payment Method:</strong> ${purchaseDetails.paymentEn}</li>
            <li><strong>Notes from Customer:</strong> ${purchaseDetails.requestNotes || "N/A"}</li>
          </ul>
        `,
        bestRegards: "Best regards,",
        team: "SONA3 Team",
      },
      ar: {
        subject: "إشعار بعملية شراء جديدة",
        greeting: `مرحبًا ${purchaseDetails.seller.userName},`,
        message: `تم شراء طلب خدمة جديدة من متجرك "${purchaseDetails.shop.nameAr}". إليك تفاصيل عملية الشراء:`,
        details: `
          <ul>
            <li><strong>رقم الطلب:</strong> ${purchaseDetails._id}</li>
            <li><strong>اسم العميل:</strong> ${purchaseDetails.customer.name}</li>
            <li><strong>رقم هاتف العميل:</strong> ${purchaseDetails.customer.phone}</li>
            <li><strong>اسم المتجر:</strong> ${purchaseDetails.shop.nameAr}</li>
            <li><strong>الخدمة:</strong> ${purchaseDetails.service.nameAr}</li>
            <li><strong>وصف الخدمة:</strong> ${purchaseDetails.service.descriptionAr}</li>
            <li><strong>السعر الأساسي:</strong> درهم إماراتي${purchaseDetails.service.basePrice}</li>
            <li><strong>إجمالي الخدمة:</strong> درهم إماراتي${purchaseDetails.serviceTotal}</li>
            <li><strong>إجمالي الطلب:</strong> درهم إماراتي${purchaseDetails.orderTotal}</li>
            <li><strong>الضرائب:</strong> ${purchaseDetails.taxesRate}% (درهم إماراتي${purchaseDetails.taxesTotal})</li>
            <li><strong>طريقة الدفع:</strong> ${purchaseDetails.paymentAr}</li>
            <li><strong>ملاحظات من العميل:</strong> ${purchaseDetails.requestNotes || "لا يوجد"}</li>
          </ul>
        `,
        bestRegards: "مع أطيب التحيات،",
        team: "فريق صناع",
      },
    };

    const selectedContent = content[lang];

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${selectedContent.subject}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            direction: ${lang === "ar" ? "rtl" : "ltr"}; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background-color: #88050d; 
            color: #fff; 
            text-align: center; 
            padding: 20px; 
            border-radius: 5px 5px 0 0; 
          }
          .content { 
            background-color: #fff; 
            padding: 30px; 
            border: 1px solid #d4d4d4;
            border-radius: 0 0 5px 5px;
          }
          ul { margin: 10px 0; padding-${lang === "ar" ? "right" : "left"}: 20px; }
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
            ${selectedContent.details}
            <p>${selectedContent.bestRegards}<br>${selectedContent.team}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      ${selectedContent.greeting}

      ${selectedContent.message}

      Purchase Details:
      - Order ID: ${purchaseDetails._id}
      - Customer Name: ${purchaseDetails.customer.name}
      - Customer Phone: ${purchaseDetails.customer.phone}
      - Shop Name: ${purchaseDetails.shop.nameEn}
      - Service: ${purchaseDetails.service.nameEn}
      - Service Description: ${purchaseDetails.service.descriptionEn}
      - Service Base Price: AED${purchaseDetails.service.basePrice}
      - Order Total: AED${purchaseDetails.orderTotal}
      - Taxes: ${purchaseDetails.taxesRate}% (AED${purchaseDetails.taxesTotal})
      - Payment Method: ${purchaseDetails.paymentMethod}
      - Notes from Customer: ${purchaseDetails.requestNotes || "N/A"}

      ${selectedContent.bestRegards}
      ${selectedContent.team}
    `;

    const emailResult = await sendEmail(
      purchaseDetails.seller.email,
      selectedContent.subject,
      textContent,
      htmlContent,
      lang
    );

    return emailResult.success
      ? { success: true, code: 200, message: "Purchase notification email sent to seller successfully" }
      : { success: false, code: 500, error: "Failed to send purchase notification email to seller" };
  } catch (err) {
    console.error("Error in sendPurchaseConfirmationEmailToSeller:", err.message);
    return { success: false, code: 500, error: "Failed to send purchase notification email to seller" };
  }
};


const generateRandomOTPCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};