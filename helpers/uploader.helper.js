let multer = require('multer');
const i18n = require('i18n');


exports.uploadImagesToMemory = () => {
    try {
        const storage = multer.memoryStorage();
        const upload = multer({
            storage,
            fileFilter: (req, file, cb) => {
                if (file) {
                    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
                        cb(null, true);

                    } else cb(new multer.MulterError(i18n.__("validImageFile")), false);

                }

                else cb(new multer.MulterError(i18n.__("requiredImage")), false);

            },
            limits: { fileSize: 3000000, files: 8 },
        });
        return upload;
    } catch (err) {
        console.log("err.message", err.message);
        return
    }
}


