const i18n = require('i18n');
const notificationRepo = require("../../modules/Notification/notification.repo");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.listNotifications = async (req, res) => {
    try {
        let filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        if (filterObject.seenBy == "false") filterObject.seenBy = { $nin: [req.tokenData._id] }

        filterObject.$or = [
            { toAll: true },
            { toAllCustomers: true },
            { receivers: filterObject.receivers || req.tokenData._id }
        ]
        delete filterObject["receivers"]
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
