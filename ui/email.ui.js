const BUCKET_NAME = process.env.BUCKETEER_BUCKET_NAME;
const SONA3_LOGO = `https://${BUCKET_NAME}.s3.amazonaws.com/public/assets/a94c3586-e660-4512-b709-7b079bbe5863-logo.png`
const SONA3_FACEBOOK = `https://${BUCKET_NAME}.s3.amazonaws.com/public/assets/65e580a5-8db3-4a80-8511-9c419b65342b-facebook.png`
const SONA3_TWITTER = `https://${BUCKET_NAME}.s3.amazonaws.com/public/assets/5effe0e3-b68e-4377-ac67-5d00a806a9ed-twitter.png`
const SONA3_INSTAGRAM = `https://${BUCKET_NAME}.s3.amazonaws.com/public/assets/b514a5a4-525a-46b4-830f-25e22fe749fd-instagram.png`
const SONA3_SELLER_PLACEHOLDER = `https://${BUCKET_NAME}.s3.amazonaws.com/public/assets/a553829a-96a5-43e6-b6cd-886cdf1efc27-verifiedSeller.png`
const SONA3_SHOP_PLACEHOLDER = `https://${BUCKET_NAME}.s3.amazonaws.com/public/assets/7e932242-1b06-41f5-aec0-c75eed4e3748-shopPlaceholder.png`


exports.setEmailHeader = (lang, subject) => {
    return `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
        ${this.setEmailStyles()}
      </head>
    `
}


exports.setEmailStyles = () => {
    return `
        <style>
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                background-color: #ffffff;
                color: #333333;
              }
    
              .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border: 1px solid #e4e4e7;
                border-radius: 8px;
                overflow: hidden;
              }
    
              .email-header {
                text-align: left;
                padding: 20px 40px 0 40px;
              }
    
              .email-header img {
                max-width: 150px;
              }
    
              .email-body {
                padding: 20px 40px;
                text-align: left;
                color: #475467;
              }
    
              .email-body h1 {
                font-size: 24px;
                color: #101828;
                margin-bottom: 10px;
              }
    
              .email-body .code {
                font-size: 36px;
                color: #881719;
                font-weight: bold;
                margin: 30px 0 30px 20px;
                letter-spacing: 40px;
              }
    
              .email-body p {
                font-size: 16px;
                line-height: 1.5;
                margin: 10px 0;
              }
    
              .email-body .cta-button {
                display: inline-block;
                margin: 20px 0;
                padding: 12px 24px;
                background-color: #881719;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
              }
    
              .email-footer {
                text-align: left;
                display: flex;
                justify-content: space-between;
                padding: 20px 40px;
                background-color: #f9fafb;
                color: #888888;
              }
    
              .email-footer img {
                max-width: 70px;
                margin: 0 5px;
              }
    
              .email-footer a {
                text-decoration: none;
              }
        </style>
    `
}


exports.setEmailLogo = () => {
    return `
        <div class="email-header">
            <img src="${SONA3_LOGO}" alt="Sona3 Logo" width="150" height="50"/>
        </div>
    `
}


exports.setEmailFooter = () => {
    return `
        <div class="email-footer" style="justify-content: space-between;">
            <!-- <img src="${SONA3_LOGO}" alt="Sona3 Logo" /> -->
            <div>
              <a href="https://www.facebook.com/sona3app"><img src="${SONA3_FACEBOOK}" alt="Facebook" /></a>
              <a href="https://x.com/Sona3app"><img src="${SONA3_TWITTER}" alt="Twitter" /></a>
              <a href="https://www.instagram.com/sona3app/"><img src="${SONA3_INSTAGRAM}" alt="Instagram" /></a>
            </div>
        </div> 
    `
}


exports.setSellerPlaceholder = () => SONA3_SELLER_PLACEHOLDER


exports.setShopPlaceholder = () => SONA3_SHOP_PLACEHOLDER


