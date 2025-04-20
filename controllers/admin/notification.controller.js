const i18n = require('i18n');
const notificationRepo = require("../../modules/Notification/notification.repo");
const notificationHelper = require("../../helpers/notification.helper")
const { logInTestEnv } = require("../../helpers/logger.helper");

exports.createNotification = async (req, res) => {
    try {
        const operationResultObject = await notificationRepo.create(req.body);
        notificationHelper.sendPushNotification(operationResultObject.result.title, operationResultObject.result.body, req.body.deviceTokens)
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }

}


exports.listNotifications = async (req, res) => {
    try {
        let filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        if (filterObject.seenBy == "false") filterObject.seenBy = { $nin: [req.tokenData._id] }

        const operationResultObject = await notificationRepo.list(filterObject, { receivers: 0 }, { timestamp: -1 }, pageNumber, limitNumber);
        operationResultObject.result = notificationRepo.isSeenByUser(operationResultObject.result, req.tokenData._id)
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


exports.getNotification = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await notificationRepo.get(filterObject, { receivers: 0 });
        operationResultObject.result = notificationRepo.isSeenByUser([operationResultObject.result], req.tokenData._id)
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



exports.updateNotification = async (req, res) => {
    try {
        const operationResultObject = await notificationRepo.update(req.query._id, req.body);
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


exports.removeNotification = async (req, res) => {
    try {
        const operationResultObject = await notificationRepo.remove(req.query._id);
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
