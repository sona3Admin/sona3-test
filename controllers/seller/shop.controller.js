const i18n = require('i18n');
const shopRepo = require("../../modules/Shop/shop.repo");
const s3StorageHelper = require("../../utils/s3FileStorage.util")
const batchRepo = require("../../modules/Batch/batch.repo");


exports.createShop = async (req, res) => {
    try {
        const operationResultObject = await shopRepo.create(req.body);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }

}


exports.getShop = async (req, res) => {
    try {
        const filterObject = req.query;
        // filterObject["isActive"] = true
        // filterObject["isVerified"] = true
        const operationResultObject = await shopRepo.get(filterObject, {});
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.listShops = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        // filterObject["isActive"] = true
        // filterObject["isVerified"] = true
        const operationResultObject = await shopRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.updateShop = async (req, res) => {
    try {
        const operationResultObject = await shopRepo.update(req.query._id, req.body);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.removeShop = async (req, res) => {
    try {
        const operationResultObject = await shopRepo.remove(req.query._id);
        return res.status(operationResultObject.code).json(operationResultObject);
    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.uploadImage = async (req, res) => {
    try {
        const existingObject = await shopRepo.get({ _id: req.query._id }, { image: 1 })
        let oldImageObject = (existingObject.success && existingObject.result.image) ? (existingObject.result.image) : false

        if (oldImageObject) await batchRepo.create({ filesToDelete: [oldImageObject.key] })

        let operationResultArray = await s3StorageHelper.uploadFilesToS3("shops", req.files)
        let operationResultObject = await shopRepo.updateDirectly(req.query._id, { image: operationResultArray[0] });
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.deleteImage = async (req, res) => {
    try {
        const existingObject = await shopRepo.get({ _id: req.query._id }, { image: 1 })
        let imageObject = (existingObject.success && existingObject.result.image) ? (existingObject.result.image) : false
        if (imageObject) await batchRepo.create({ filesToDelete: [imageObject.key] })
        const operationResultObject = await shopRepo.updateDirectly(req.query._id, { $unset: { image: 1 } });
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.uploadCovers = async (req, res) => {
    try {
        const existingObject = await shopRepo.get({ _id: req.query._id }, { covers: 1 })
        let coversArray = (existingObject.success && existingObject.result.covers) ? (existingObject.result.covers) : 0
        let numberOfCovers = coversArray.length + req.files.length

        if (numberOfCovers > 10) return res.status(409).json({
            success: false,
            code: 409,
            error: i18n.__("limitExceeded")
        });

        let operationResultArray = await s3StorageHelper.uploadFilesToS3("shopCovers", req.files)
        operationResultArray.map((cover) => {
            coversArray.push(cover)
        });

        let operationResultObject = await shopRepo.updateDirectly(req.query._id, { covers: operationResultArray });
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.deleteCovers = async (req, res) => {
    try {
        let coversToDelete = req.body.keys
        let operationResultObject
        const existingObject = await shopRepo.get({ _id: req.query._id }, { covers: 1 })
        if (!existingObject.success) return res.status(result.code).json({ success: result.success, code: result.code });


        await coversToDelete.map((pathToFile) => {
            operationResultObject = shopRepo.updateDirectly(req.query._id, { $pull: { covers: { key: pathToFile } } });
        });

        await batchRepo.create({ filesToDelete: coversToDelete })
        return res.status(operationResultObject.code).json(operationResultObject);


    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}
