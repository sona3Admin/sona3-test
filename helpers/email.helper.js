const { sendEmail } = require("../utils/emailSender.util");
const { setEmailHeader, setEmailLogo, setEmailFooter, setSellerPlaceholder, setShopPlaceholder } = require("../ui/email.ui");
const { logInTestEnv } = require("./logger.helper");



exports.sendEmailVerificationCode = async (receiverObject, lang, emailType) => {
  try {

    const otpCode = generateRandomOTPCode();
    lang = !lang || lang === "en" ? "en" : "ar";

    const content = {
      en: {
        verifyEmail: {
          subject: "Verify Your Sona3 Account",
          greeting: `Hi ${receiverObject?.name || receiverObject?.userName},`,
          message: "This is your verification code:",
          footerMessage: "This code will only be valid for the next 5 minutes.",
          signature: "Best regards,",
          team: "SONA3 Team",
          ignore: "If you didn't request this code, please ignore this email.",
        },
        resetPassword: {
          subject: "Reset Your Sona3 Account Password",
          greeting: `Hi ${receiverObject?.name || receiverObject?.userName},`,
          message: "We received a request to reset your Sona3 account password. To proceed with the password reset, please use the following code:",
          footerMessage: "If you didn’t request this password reset, please ignore this email and ensure your account is secure.",
          signature: "Best regards,",
          team: "SONA3 Team",
          ignore: "If you didn't request this code, please ignore this email.",
        },
      },
      ar: {
        verifyEmail: {
          subject: "تأكيد حسابك على صناع",
          greeting: `مرحبًا ${receiverObject?.name || receiverObject?.userName},`,
          message: "هذا هو رمز التحقق الخاص بك:",
          footerMessage: "هذا الرمز سيبقى صالحًا لمدة 5 دقائق فقط.",
          signature: "مع أطيب التحيات،",
          team: "فريق صناع",
          ignore: "إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد.",
        },
        resetPassword: {
          subject: "إعادة تعيين كلمة المرور لحسابك على صناع",
          greeting: `مرحبًا ${receiverObject?.name || receiverObject?.userName},`,
          message: "لقد تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك على صناع. للمتابعة مع إعادة تعيين كلمة المرور، يرجى استخدام الرمز التالي:",
          footerMessage: "إذا لم تطلب هذه العملية، يرجى تجاهل هذا البريد وتأكد من أمان حسابك.",
          signature: "مع أطيب التحيات،",
          team: "فريق صناع",
          ignore: "إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد.",
        },
      },
    };

    const type = emailType === "resetPassword" ? "resetPassword" : "verifyEmail";
    const selectedContent = content[lang][type];

    const htmlContent = `
      ${setEmailHeader(lang, selectedContent.subject)}
      <body dir="${lang === 'ar' ? 'rtl' : 'ltr'}" style="text-align: ${lang === 'ar' ? 'right' : 'left'}; font-family: Arial, sans-serif;">
        <div class="email-container" style="max-width: 600px; margin: auto; padding: 20px;">
          ${setEmailLogo()}
          
          <div class="email-body" style="direction: ${lang === 'ar' ? 'rtl' : 'ltr'}; text-align: ${lang === 'ar' ? 'right' : 'left'};">
            <p style="font-size: 18px;">${selectedContent.greeting}</p>
            <p style="font-size: 16px;">${selectedContent.message}</p>
            
            <table align="center" style="margin: 20px auto;">
              <tr>
                ${otpCode.split('').map(digit => `
                  <td style="
                    width: 45px;
                    height: 55px;
                    background: #f2f2f2;
                    border-radius: 8px;
                    text-align: center;
                    vertical-align: middle;
                    font-size: 24px;
                    font-weight: bold;
                    color: #333;
                    padding: 10px;
                    margin: 0 5px;
                  ">
                    ${digit}
                  </td>
                `).join('')}
              </tr>
            </table>

            
            <p style="font-size: 16px;">${selectedContent.footerMessage}</p>
            <p class="signature" style="font-size: 16px;">
              ${selectedContent.signature}<br />
              ${selectedContent.team}
            </p>
            
            <p style="font-size: 14px; color: #888888; margin-top: 50px;">
              ${selectedContent.ignore}
            </p>
          </div>

          ${setEmailFooter()}
        </div>
      </body>
      </html>
    `;


    const textContent = `
      ${selectedContent.greeting}

      ${selectedContent.message}

      ${otpCode}

      ${selectedContent.footerMessage}

      ${selectedContent.signature}
      ${selectedContent.team}

      ${selectedContent.ignore}
    `;

    const emailResult = await sendEmail(
      receiverObject.email,
      selectedContent.subject,
      textContent,
      htmlContent,
      lang
    );

    if (emailResult.success) {
      logInTestEnv("Email Sent Successfully...");
      return {
        success: true,
        code: 200,
        result: otpCode,
      };
    } else {
      console.error("Failed to send verification email");
      return {
        success: false,
        code: 500,
        error: "Failed to send verification email",
      };
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
    const sellerImage = receiverObject?.image?.Location || setSellerPlaceholder();
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
      ${setEmailHeader(lang, selectedContent.subject)}
      <body>
        <div class="email-container">
          <!-- Email Header -->
          ${setEmailLogo()}
          
          <!-- Email Body -->
          <div class="email-body">
            <div style="text-align: center;">
              <img src="${sellerImage}" alt="Seller Image" width="120" height="120" style="display: block; margin: 0 auto; border-radius: 50%;" />
            </div>
            <h1>${selectedContent.subject}</h1>
            <p>${selectedContent.greeting}</p>
            <p>${selectedContent.message}</p>
            <p>${selectedContent.support}</p>
          </div>

          <!-- Email Footer -->
          ${setEmailFooter()}
        </div>
      </body>
      </html>
    `;

    const textContent = `
      ${selectedContent.greeting}

      ${selectedContent.message}

      ${selectedContent.support}

      ${selectedContent.bestRegards}
      ${selectedContent.team}
    `;

    const emailResult = await sendEmail(
      receiverObject.email,
      selectedContent.subject,
      textContent,
      htmlContent,
      lang
    );

    if (emailResult.success) {
      logInTestEnv("Verification confirmation email sent successfully...");
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
    const shopImage = receiverObject?.image?.Location || setShopPlaceholder();
    logInTestEnv("shopImage", shopImage)
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
      ${setEmailHeader(lang, selectedContent.subject)}
      <body>
        <div class="email-container">
          <!-- Email Header -->
          ${setEmailLogo()}
          
          <!-- Email Body -->
          <div class="email-body">
            <div style="text-align: center;">
              <img src="${shopImage}" alt="Seller Image" width="120" height="120" style="display: block; margin: 0 auto; border-radius: 50%;" />
            </div>
            <h1>${selectedContent.subject}</h1>
            <p>${selectedContent.greeting}</p>
            <p>${selectedContent.message}</p>
            <p>${selectedContent.support}</p>
          </div>

          <!-- Email Footer -->
          ${setEmailFooter()}
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
      logInTestEnv("Verification confirmation email sent successfully...");
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
      ${setEmailHeader(lang, selectedContent.subject)}
      <body dir="${lang === 'ar' ? 'rtl' : 'ltr'}" style="text-align: ${lang === 'ar' ? 'right' : 'left'}; font-family: Arial, sans-serif;">
        <div class="email-container" style="margin: 0 auto; padding: 20px; max-width: 600px;">
          <!-- Email Header -->
          ${setEmailLogo()}
          
          <!-- Email Body -->
          <div class="email-body" style="direction: ${lang === 'ar' ? 'rtl' : 'ltr'}; text-align: ${lang === 'ar' ? 'right' : 'left'};">
            <h1>${selectedContent.subject}</h1>
            <p>${selectedContent.greeting}</p>
            <p>${selectedContent.message}</p>
            <div class="details">
              <ul style="list-style-position: inside; padding: 0;">
                ${selectedContent.details}
              </ul>
            </div>
          </div>

          <!-- Email Footer -->
          ${setEmailFooter()}
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
    logInTestEnv("serviceRequest.customer.email", serviceRequest.customer.email)
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
      ${setEmailHeader(lang, selectedContent.subject)}
      <body dir="${lang === 'ar' ? 'rtl' : 'ltr'}" style="text-align: ${lang === 'ar' ? 'right' : 'left'}; font-family: Arial, sans-serif;">
        <div class="email-container" style="margin: 0 auto; padding: 20px; max-width: 600px;">
          <!-- Email Header -->
          ${setEmailLogo()}
          
          <!-- Email Body -->
          <div class="email-body" style="direction: ${lang === 'ar' ? 'rtl' : 'ltr'}; text-align: ${lang === 'ar' ? 'right' : 'left'};">
            <h1>${selectedContent.subject}</h1>
            <p>${selectedContent.greeting}</p>
            <p>${selectedContent.message}</p>
            <div class="details">
              <ul style="list-style-position: inside; padding: 0;">
                ${selectedContent.details}
              </ul>
            </div>
          </div>

          <!-- Email Footer -->
          ${setEmailFooter()}
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
      ${setEmailHeader(lang, selectedContent.subject)}
      <body dir="${lang === 'ar' ? 'rtl' : 'ltr'}" style="text-align: ${lang === 'ar' ? 'right' : 'left'}; font-family: Arial, sans-serif;">
        <div class="email-container" style="margin: 0 auto; padding: 20px; max-width: 600px;">
          <!-- Email Header -->
          ${setEmailLogo()}
          
          <!-- Email Body -->
          <div class="email-body" style="direction: ${lang === 'ar' ? 'rtl' : 'ltr'}; text-align: ${lang === 'ar' ? 'right' : 'left'};">
            <h1>${selectedContent.subject}</h1>
            <p>${selectedContent.greeting}</p>
            <p>${selectedContent.message}</p>
            <div class="details">
              <ul style="list-style-position: inside; padding: 0;">
                ${selectedContent.details}
              </ul>
            </div>
          </div>

          <!-- Email Footer -->
          ${setEmailFooter()}
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

    logInTestEnv("serviceRequest.seller.email", serviceRequest.seller.email);
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
      ${setEmailHeader(lang, selectedContent.subject)}
      <body dir="${lang === 'ar' ? 'rtl' : 'ltr'}" style="text-align: ${lang === 'ar' ? 'right' : 'left'}; font-family: Arial, sans-serif;">
        <div class="email-container" style="margin: 0 auto; padding: 20px; max-width: 600px;">
          <!-- Email Header -->
          ${setEmailLogo()}
          
          <!-- Email Body -->
          <div class="email-body" style="direction: ${lang === 'ar' ? 'rtl' : 'ltr'}; text-align: ${lang === 'ar' ? 'right' : 'left'};">
            <h1>${selectedContent.subject}</h1>
            <p>${selectedContent.greeting}</p>
            <p>${selectedContent.message}</p>
            <div class="details">
              <ul style="list-style-position: inside; padding: 0;">
                ${selectedContent.details}
              </ul>
            </div>
          </div>

          <!-- Email Footer -->
          ${setEmailFooter()}
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


exports.sendOrderPurchaseConfirmationEmailToCustomer = async (orderDetails, lang) => {
  try {
    lang = !lang || lang === "en" ? "en" : "ar";
    orderDetails["paymentEn"] = orderDetails.paymentMethod == "cashOnDelivery" ? "Cash On Delivery" : "Visa"
    orderDetails["paymentAr"] = orderDetails.paymentMethod == "cashOnDelivery" ? "الدفع عند التوصيل" : "فيزا"

    const content = {
      en: {
        subject: "Purchase Confirmation",
        greeting: `Hello ${orderDetails.customer.name},`,
        message: `Thank you for your purchase on Sona3. Below are the details of your order:`,
        details: `
          <ul>
            <li><strong>Order ID:</strong> ${orderDetails._id}</li>
            <li><strong>Order Status:</strong> Pending</li>
            <li><strong>Cart Total:</strong> AED${orderDetails.cartTotal}</li>
            <li><strong>Taxes:</strong> ${orderDetails.taxesRate}% (AED${orderDetails.taxesTotal})</li>
            <li><strong>Shipping Fees Total:</strong> AED${orderDetails.shippingFeesTotal}</li>
            <li><strong>Order Total:</strong> AED${orderDetails.orderTotal}</li>
            <li><strong>Payment Method:</strong> ${orderDetails.paymentEn}</li>
          </ul>
        `,
        bestRegards: "Best regards,",
        team: "SONA3 Team",
      },
      ar: {
        subject: "تأكيد الشراء",
        greeting: `مرحبًا ${orderDetails.customer.name},`,
        message: `شكرًا لقيامك بالشراء من صناع". إليك تفاصيل طلبك:`,
        details: `
          <ul>
            <li><strong>رقم الطلب:</strong> ${orderDetails._id}</li>
            <li><strong>حالة الطلب:</strong> قيد الانتظار</li>
            <li><strong>إجمالي السلة:</strong> درهم إماراتي${orderDetails.cartTotal}</li>
            <li><strong>الضرائب:</strong> ${orderDetails.taxesRate}% (درهم إماراتي${orderDetails.taxesTotal})</li>
            <li><strong>إجمالي تكلفة التوصيل:</strong> درهم إماراتي${orderDetails.shippingFeesTotal}</li>
            <li><strong>إجمالي الطلب:</strong> درهم إماراتي${orderDetails.orderTotal}</li>
            <li><strong>طريقة الدفع:</strong> ${orderDetails.paymentAr}</li>
          </ul>
        `,
        bestRegards: "مع أطيب التحيات،",
        team: "فريق صناع",
      },
    };

    const selectedContent = content[lang];

    const htmlContent = `
      ${setEmailHeader(lang, selectedContent.subject)}
      <body dir="${lang === 'ar' ? 'rtl' : 'ltr'}" style="text-align: ${lang === 'ar' ? 'right' : 'left'}; font-family: Arial, sans-serif;">
        <div class="email-container" style="margin: 0 auto; padding: 20px; max-width: 600px;">
          <!-- Email Header -->
          ${setEmailLogo()}
          
          <!-- Email Body -->
          <div class="email-body" style="direction: ${lang === 'ar' ? 'rtl' : 'ltr'}; text-align: ${lang === 'ar' ? 'right' : 'left'};">
            <h1>${selectedContent.subject}</h1>
            <p>${selectedContent.greeting}</p>
            <p>${selectedContent.message}</p>
            <div class="details">
              ${selectedContent.details}
            </div>
          </div>

          <!-- Email Footer -->
          ${setEmailFooter()}
        </div>
      </body>
      </html>
    `;

    const textContent = `
      ${selectedContent.greeting}

      ${selectedContent.message}

      Order Details:
      - Order ID: ${orderDetails._id}
      - Order Status: ${orderDetails.status}
      - Cart Total: AED${orderDetails.cartTotal}
      - Order Total: AED${orderDetails.orderTotal}
      - Taxes: ${orderDetails.taxesRate}% (AED${orderDetails.taxesTotal})
      - Payment Method: ${orderDetails.paymentMethod}
      - Notes: ${orderDetails.requestNotes || "N/A"}

      ${selectedContent.bestRegards}
      ${selectedContent.team}
    `;

    const emailResult = await sendEmail(
      orderDetails.customer.email,
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


exports.sendOrderPurchaseConfirmationEmailToSeller = async (orderDetails, lang) => {
  try {
    lang = !lang || lang === "en" ? "en" : "ar";
    orderDetails["paymentEn"] = orderDetails.paymentMethod == "cashOnDelivery" ? "Cash On Delivery" : "Visa"
    orderDetails["paymentAr"] = orderDetails.paymentMethod == "cashOnDelivery" ? "الدفع عند التوصيل" : "فيزا"
    const content = {
      en: {
        subject: "New Purchase Notification",
        greeting: `Hello ${orderDetails.seller.userName},`,
        message: `A new order has been purchased from your shop "${orderDetails.shop.nameEn}". Below are the details of the purchase:`,
        details: `
          <ul>
            <li><strong>Order ID:</strong> ${orderDetails._id}</li>
            <li><strong>Customer Name:</strong> ${orderDetails.customer.name}</li>
            <li><strong>Customer Phone:</strong> ${orderDetails.customer.phone}</li>
            <li><strong>Shop Name:</strong> ${orderDetails.shop.nameEn}</li>
            <li><strong>Cart Total:</strong> AED${orderDetails.shopTotal}</li>
            <li><strong>Taxes:</strong> ${orderDetails.taxesRate}% (AED${orderDetails.shopTaxes})</li>
            <li><strong>Shipping Fees Total:</strong> AED${orderDetails.shopShippingFees}</li>
            <li><strong>Order Total:</strong> AED${orderDetails.subOrderTotal}</li>
            <li><strong>Payment Method:</strong> ${orderDetails.paymentEn}</li>
          </ul>
        `,
        bestRegards: "Best regards,",
        team: "SONA3 Team",
      },
      ar: {
        subject: "إشعار بعملية شراء جديدة",
        greeting: `مرحبًا ${orderDetails.seller.userName},`,
        message: `تم شراء طلب جديد من متجرك "${orderDetails.shop.nameAr}". إليك تفاصيل عملية الشراء:`,
        details: `
          <ul>
            <li><strong>رقم الطلب:</strong> ${orderDetails._id}</li>
            <li><strong>اسم العميل:</strong> ${orderDetails.customer.name}</li>
            <li><strong>رقم هاتف العميل:</strong> ${orderDetails.customer.phone}</li>
            <li><strong>اسم المتجر:</strong> ${orderDetails.shop.nameAr}</li>
            <li><strong>إجمالي السلة:</strong> درهم إماراتي${orderDetails.shopTotal}</li>
            <li><strong>الضرائب:</strong> ${orderDetails.taxesRate}% (درهم إماراتي${orderDetails.shopTaxes})</li>
            <li><strong>إجمالي التوصيل:</strong> درهم إماراتي${orderDetails.shopShippingFees}</li>
            <li><strong>إجمالي الطلب:</strong> درهم إماراتي${orderDetails.orderTotal}</li>
            <li><strong>طريقة الدفع:</strong> ${orderDetails.paymentAr}</li>
          </ul>
        `,
        bestRegards: "مع أطيب التحيات،",
        team: "فريق صناع",
      },
    };
    const selectedContent = content[lang];

    const htmlContent = `
      ${setEmailHeader(lang, selectedContent.subject)}
      <body dir="${lang === 'ar' ? 'rtl' : 'ltr'}" style="text-align: ${lang === 'ar' ? 'right' : 'left'}; font-family: Arial, sans-serif;">
        <div class="email-container" style="margin: 0 auto; padding: 20px; max-width: 600px;">
          <!-- Email Header -->
          ${setEmailLogo()}
          
          <!-- Email Body -->
          <div class="email-body" style="direction: ${lang === 'ar' ? 'rtl' : 'ltr'}; text-align: ${lang === 'ar' ? 'right' : 'left'};">
            <h1>${selectedContent.subject}</h1>
            <p>${selectedContent.greeting}</p>
            <p>${selectedContent.message}</p>
            <div class="details">
              <ul style="list-style-position: inside; padding: 0;">
                ${selectedContent.details}
              </ul>
            </div>
          </div>

          <!-- Email Footer -->
          ${setEmailFooter()}
        </div>
      </body>
      </html>
    `;

    const textContent = `
      ${selectedContent.greeting}

      ${selectedContent.message}

      Purchase Details:
      - Order ID: ${orderDetails._id}
      - Customer Name: ${orderDetails.customer.name}
      - Customer Phone: ${orderDetails.customer.phone}
      - Shop Name: ${orderDetails.shop.nameEn}
      - Order Total: AED${orderDetails.subOrderTotal}
      - Taxes: ${orderDetails.taxesRate}% (AED${orderDetails.shopTaxes})
      - Payment Method: ${orderDetails.paymentMethod}
      ${selectedContent.bestRegards}
      ${selectedContent.team}
    `;

    const emailResult = await sendEmail(
      orderDetails.seller.email,
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