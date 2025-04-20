const i18n = require('i18n');
const shopRepo = require("../../modules/Shop/shop.repo");
const s3StorageHelper = require("../../utils/s3FileStorage.util")
const batchRepo = require("../../modules/Batch/batch.repo");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.createShop = async (req, res) => {
    try {
        const operationResultObject = await shopRepo.create(req.body);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
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
        filterObject["isDeleted"] = false
        const operationResultObject = await shopRepo.get(filterObject, {});
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
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
        filterObject["isDeleted"] = false
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await shopRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.updateShop = async (req, res) => {
    try {
        req.body.isVerified = false
        const operationResultObject = await shopRepo.update({ _id: req.query._id, seller: req.query.seller }, req.body);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.removeShop = async (req, res) => {
    try {
        const operationResultObject = await shopRepo.remove({ _id: req.query._id, seller: req.query.seller });
        return res.status(operationResultObject.code).json(operationResultObject);
    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.uploadImage = async (req, res) => {
    try {
        if (!req.files || req.files.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("fileNotReceived") });

        const existingObject = await shopRepo.find({ _id: req.query._id, seller: req.query.seller })
        let oldImageObject = (existingObject.success && existingObject.result.image) ? (existingObject.result.image) : false

        if (oldImageObject) await batchRepo.create({ filesToDelete: [oldImageObject.key] })

        let operationResultArray = await s3StorageHelper.uploadFilesToS3("shops", req.files)
        if (!operationResultArray.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
        let operationResultObject = await shopRepo.updateDirectly(req.query._id, { image: operationResultArray.result[0], isVerified: false });
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.deleteImage = async (req, res) => {
    try {
        const existingObject = await shopRepo.find({ _id: req.query._id, seller: req.query.seller })
        let imageObject = (existingObject.success && existingObject.result.image) ? (existingObject.result.image) : false
        if (imageObject) await batchRepo.create({ filesToDelete: [imageObject.key] })
        const operationResultObject = await shopRepo.updateDirectly(req.query._id, { $unset: { image: 1 } });
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.uploadCovers = async (req, res) => {
    try {
        if (!req.files || req.files.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("fileNotReceived") });

        const existingObject = await shopRepo.find({ _id: req.query._id, seller: req.query.seller })
        let coversArray = (existingObject.success && existingObject.result.covers) ? (existingObject.result.covers) : 0
        let numberOfCovers = coversArray.length + req.files.length
        if (numberOfCovers > 10) return res.status(409).json({
            success: false,
            code: 409,
            error: i18n.__("limitExceeded")
        });

        let operationResultArray = await s3StorageHelper.uploadFilesToS3("shopCovers", req.files)
        if (!operationResultArray.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
        coversArray = Array.from(coversArray)
        coversArray.map((cover) => {
            operationResultArray.result.push(cover)
        });
        let operationResultObject = await shopRepo.updateDirectly(req.query._id, { covers: operationResultArray.result, isVerified: false });
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.deleteCovers = async (req, res) => {
    try {
        const { keys } = req.body;

        const existingObject = await shopRepo.find({ _id: req.query._id, seller: req.query.seller });
        if (!existingObject.success) return res.status(existingObject.code).json(existingObject);

        const pullQuery = { $pull: { covers: { key: { $in: keys } } } };
        const updateOperation = await shopRepo.updateDirectly(req.query._id, pullQuery);

        if (!updateOperation.success) return res.status(updateOperation.code).json(updateOperation);


        batchRepo.create({ filesToDelete: keys });

        return res.status(updateOperation.code).json(updateOperation);

    } catch (err) {
        console.error(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
};


exports.uploadBanners = async (req, res) => {
    try {
        if (!req.files || req.files.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("fileNotReceived") });

        const existingObject = await shopRepo.find({ _id: req.query._id, seller: req.query.seller })
        let bannersArray = (existingObject.success && existingObject.result.banners) ? (existingObject.result.banners) : 0
        let numberOfBanners = bannersArray.length + req.files.length
        if (numberOfBanners > 10) return res.status(409).json({
            success: false,
            code: 409,
            error: i18n.__("limitExceeded")
        });

        let operationResultArray = await s3StorageHelper.uploadFilesToS3("banners", req.files)
        bannersArray = Array.from(bannersArray)
        bannersArray.map((banner) => {
            operationResultArray.result.push(banner)
        });
        let operationResultObject = await shopRepo.updateDirectly(req.query._id, { banners: operationResultArray.result, isVerified: false });
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.deleteBanners = async (req, res) => {
    try {
        const { keys } = req.body;

        const existingObject = await shopRepo.find({ _id: req.query._id, seller: req.query.seller });
        if (!existingObject.success) return res.status(existingObject.code).json(existingObject);

        const pullQuery = { $pull: { banners: { key: { $in: keys } } } };
        const updateOperation = await shopRepo.updateDirectly(req.query._id, pullQuery);

        if (!updateOperation.success) return res.status(updateOperation.code).json(updateOperation);


        batchRepo.create({ filesToDelete: keys });

        return res.status(updateOperation.code).json(updateOperation);

    } catch (err) {
        console.error(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.uploadShopLicense = async (req, res) => {
    try {
        if (!req.files || req.files.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("fileNotReceived") });

        const existingObject = await shopRepo.find({ _id: req.query._id, seller: req.query.seller })
        let images = (existingObject.success && existingObject.result.shopLicense) ? (existingObject.result.shopLicense) : 0
        let numberOfCovers = images.length + req.files.length
        if (numberOfCovers > 10) return res.status(409).json({
            success: false,
            code: 409,
            error: i18n.__("limitExceeded")
        });

        let operationResultArray
        if (req.query.fileType === "pdf") operationResultArray = await s3StorageHelper.uploadPDFtoS3("identity", req.files)
        if (req.query.fileType === "img") operationResultArray = await s3StorageHelper.uploadFilesToS3("identity", req.files)

        if (!operationResultArray.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
        images = Array.from(images)
        images.map((image) => {
            operationResultArray.result.push(image)
        });
        let operationResultObject = await shopRepo.updateDirectly(req.query._id, { shopLicense: operationResultArray.result, isVerified: false });
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.deleteShopLicense = async (req, res) => {
    try {
        const { keys } = req.body;

        const existingObject = await shopRepo.find({ _id: req.query._id, seller: req.query.seller });
        if (!existingObject.success) return res.status(existingObject.code).json(existingObject);

        const pullQuery = { $pull: { shopLicense: { key: { $in: keys } } } };
        const updateOperation = await shopRepo.updateDirectly(req.query._id, pullQuery);

        if (!updateOperation.success) return res.status(updateOperation.code).json(updateOperation);


        batchRepo.create({ filesToDelete: keys });

        return res.status(updateOperation.code).json(updateOperation);

    } catch (err) {
        console.error(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
};