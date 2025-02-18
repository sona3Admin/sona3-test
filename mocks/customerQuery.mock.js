const i18n = require('i18n');

const serviceModel = require("../modules/Service/service.model");



exports.executeQuery = async (req, res) => {
    try {
        let allServices = await serviceModel.find({ isDeleted: false });
        for (const service of allServices) {
            if(service?.orderCount == undefined){
                console.log(`service has no order count`, service)
                await serviceModel.updateOne({ _id: service._id }, { orderCount: 0 })
            }
            console.log(`service`, service?.orderCount, service?._id)
        }

        return res.status(200).json({
            success: true,
            code: 200,

        });

    } catch (err) {
        console.error(`Error in countShops: ${err.message}`);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
};



