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


exports.processPDFContent = async (pdfContent) => {
    try {
        console.log("PDF content prefix:", pdfContent.substring(0, 50));
        console.log("PDF content length:", pdfContent.length);

        if (!pdfContent.startsWith('%PDF-')) {
            console.log("Invalid PDF content");
            return { error: "Invalid PDF content", success: false, code: 400 };
        }

        // Convert the string to a Uint8Array
        const pdfBuffer = new TextEncoder().encode(pdfContent);

        // Load the existing PDF
        const pdfDoc = await PDFDocument.load(pdfBuffer);

        // If you need to modify the PDF, you can do so here
        // For example, you could add a new page, add text, etc.

        // Save the PDF to a buffer
        const pdfBytes = await pdfDoc.save();

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