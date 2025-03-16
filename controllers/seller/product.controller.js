const i18n = require('i18n');
const productRepo = require("../../modules/Product/product.repo");


exports.createProduct = async (req, res) => {
    try {
        const operationResultObject = await productRepo.create(req.body);
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


exports.listProducts = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isDeleted"] = false
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        filterObject["seller"] = req.tokenData._id
        const operationResultObject = await productRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.getProduct = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isDeleted"] = false
        const operationResultObject = await productRepo.get(filterObject, {});
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


exports.updateProduct = async (req, res) => {
    try {
        req.body.isVerified = false
        const operationResultObject = await productRepo.update({ _id: req.query._id, seller: req.query.seller }, req.body);
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


exports.removeProduct = async (req, res) => {
    try {
        const operationResultObject = await productRepo.remove({ _id: req.query._id, seller: req.query.seller });
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
