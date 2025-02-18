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
    } catch {
        return false;
    }
}


exports.processPDFContent = async (pdfContent) => {
    try {
        console.log("Received pdfContent type:", typeof pdfContent);
        console.log("pdfContent length:", pdfContent.length);
        console.log("First 100 characters of pdfContent:", pdfContent.slice(0, 100));

        if (typeof pdfContent !== 'string') {
            console.log("Invalid input: not a string");
            return { error: "Invalid input: not a string", success: false, code: 400 };
        }

        const pdfBuffer = Buffer.from(pdfContent, 'binary');
        console.log("pdfBuffer length:", pdfBuffer.length);
        console.log("First 20 bytes of pdfBuffer:", pdfBuffer.slice(0, 20));

        if (!pdfBuffer.slice(0, 5).toString().startsWith('%PDF-')) {
            console.log("Invalid PDF content: doesn't start with %PDF-");
            return { error: "Invalid PDF content", success: false, code: 400 };
        }

        const pdfDoc = await PDFDocument.load(pdfBuffer);
        console.log("PDF loaded successfully. Page count:", pdfDoc.getPageCount());

        const pdfBytes = await pdfDoc.save();
        console.log("Saved PDF size:", pdfBytes.length);

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