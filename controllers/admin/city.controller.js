const i18n = require('i18n');
const cityRepo = require("../../modules/City/city.repo");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.listCities = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await cityRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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

exports.getCity = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await cityRepo.get(filterObject, {});
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


exports.createCity = async (req, res) => {
    try {
        const operationResultObject = await cityRepo.create(req.body);
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

exports.addFirstFlightCity = async (req, res) => {
    try {
        const operationResultObject = await cityRepo.addFirstFlightCity(req.query._id,req.body);
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

exports.removeFirstFlightCity = async (req, res) => {
    try {
        const operationResultObject = await cityRepo.removeFirstFlightCity(req.query._id, req.query.CityName);
        return res.status(operationResultObject.code).json(operationResultObject);
    }
    catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}

exports.addIfastCity = async (req, res) => {
    try {
        const operationResultObject = await cityRepo.addIfastCity(req.query._id, req.body);
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

exports.removeIfastCity = async (req, res) => {
    try {
        const operationResultObject = await cityRepo.removeIfastCity(req.query._id);
        return res.status(operationResultObject.code).json(operationResultObject);
    }
    catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}

exports.removeCity = async (req, res) => {
    try {
        const operationResultObject = await cityRepo.remove(req.query._id);
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