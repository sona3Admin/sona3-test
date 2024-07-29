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
        // Check if pdfContent is a string
        if (typeof pdfContent !== 'string') {
            console.log("Invalid input: not a string");
            return { error: "Invalid input: not a string", success: false, code: 400 };
        }

        // Convert the string to a Buffer
        const pdfBuffer = Buffer.from(pdfContent, 'binary');

        // Check if the buffer starts with the PDF signature
        if (!pdfBuffer.slice(0, 5).toString().startsWith('%PDF-')) {
            console.log("Invalid PDF content");
            return { error: "Invalid PDF content", success: false, code: 400 };
        }

        const pdfDoc = await PDFDocument.load(pdfBuffer);

        const pdfBytes = await pdfDoc.save();
        console.log("pdfBytes", pdfBytes)
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