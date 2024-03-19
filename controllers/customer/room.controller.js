const i18n = require('i18n');
const roomRepo = require("../../modules/Room/room.repo");


exports.listRooms = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await roomRepo.list(filterObject, { messages: 0 }, { lastUpdate: -1 }, pageNumber, limitNumber);
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


exports.getRoom = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await roomRepo.get(filterObject, {});
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