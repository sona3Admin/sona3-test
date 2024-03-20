const i18n = require('i18n');
const notificationRepo = require("../../modules/Notification/notification.repo");


exports.listNotifications = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await notificationRepo.list(filterObject, { receivers: 0, seenBy: 0 }, { timestamp: -1 }, pageNumber, limitNumber);
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


exports.getNotification = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await notificationRepo.get(filterObject, { receivers: 0, seenBy: 0 });
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
