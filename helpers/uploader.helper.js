let multer = require('multer');
const i18n = require('i18n');

exports.uploadImagesToMemory = () => {
    try {
        const storage = multer.memoryStorage();
        const upload = multer({
            storage,
            fileFilter: (req, file, cb) => {
                if (file) {
                    const allowedMimeTypes = [
                        "image/png",
                        "image/jpg",
                        "image/jpeg",
                        "image/svg+xml",
                        "application/pdf"
                    ];

                    if (allowedMimeTypes.includes(file.mimetype)) {
                        cb(null, true);
                    } else {
                        cb(new multer.MulterError(i18n.__("validImageFile")), false);
                    }
                } else {
                    cb(new multer.MulterError(i18n.__("requiredImage")), false);
                }
            },
            limits: {
                fileSize: 3000000, // 3MB limit
                files: 8
            },
        });
        return upload;
    } catch (err) {
        console.log("err.message", err.message);
        return
    }
}