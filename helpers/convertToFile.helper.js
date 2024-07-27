const { PDFDocument } = require('pdf-lib');

exports.convertBase64StringToPDF = async (base64String) => {
    try {
        
        if (!isValidBase64(base64String)) return { error: "Invalid base64 string", success: false, code: 400 };
        
        const pdfBuffer = Buffer.from(base64String, 'base64');
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pdfBytes = await pdfDoc.save();

        console.log("Converting the pdf was successfull!")
        return {
            success: true,
            code: 200,
            result: pdfBytes
        };
    } catch (err) {
        console.log("Error in processing PDF:", err.message);
        return { error: err.message, success: false, code: 500 };
    }
};


function isValidBase64(str) {
    try {
        return Buffer.from(str, 'base64').toString('base64') === str;
    } catch (err) {
        return false;
    }
}