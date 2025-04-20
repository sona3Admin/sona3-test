const i18n = require('i18n');
const orderModel = require("./order.model")
const { prepareQueryObjects } = require("../../helpers/query.helper")
const mongoose = require("mongoose");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.find = async (filterObject) => {
    try {
        const resultObject = await orderModel.findOne(filterObject).lean();
        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        return {
            success: true,
            code: 200,
            result: resultObject
        }

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
    }

}


exports.get = async (filterObject, selectionObject) => {
    try {
        const resultObject = await orderModel.findOne(filterObject).lean()
            .populate({ path: "customer", select: "name phone image fcmToken" })
            .populate({ path: "sellers", select: "name fcmToken" })
            .populate({ path: "subOrders.shop", select: "nameEn nameAr phone image location address" })
            .select(selectionObject)

        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        return {
            success: true,
            code: 200,
            result: resultObject,
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.list = async (filterObject, selectionObject, sortObject, pageNumber, limitNumber) => {
    try {
        let normalizedQueryObjects = await prepareQueryObjects(filterObject, sortObject)
        filterObject = normalizedQueryObjects.filterObject
        sortObject = normalizedQueryObjects.sortObject
        const resultArray = await orderModel.find(filterObject).lean()
            .populate({ path: "customer", select: "name image" })
            .populate({ path: "subOrders.shop", select: "nameEn nameAr image" })
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const count = await orderModel.count(filterObject);
        return {
            success: true,
            code: 200,
            result: resultArray,
            count
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.aggregate = async (filterObject, selectionObject) => {
    try {
        // Normalize filterObject using the prepareQueryObjects function
        const normalizedQueryObjects = await prepareQueryObjects(filterObject, {});
        filterObject = normalizedQueryObjects.filterObject;
        // Helper function to create a projection object based on the selection object
        const createProjection = (selectionObj) => {
            return Object.entries(selectionObj).reduce((projection, [key, value]) => {
                if (typeof value === 'object') {
                    projection[key] = {
                        $map: {
                            input: `$${key}`,
                            as: "item",
                            in: createProjection(value)
                        }
                    };
                } else if (value) {
                    projection[key] = value;
                }
                return projection;
            }, {});
        };

        // Projection for the subOrders array to include only `status` and `shippingStatus`
        const subOrdersProjection = {
            subOrders: {
                $map: {
                    input: "$subOrders",
                    as: "subOrder",
                    in: {
                        seller: "$$subOrder.seller",
                        shop: "$$subOrder.shop",
                        shopTotal: "$$subOrder.shopTotal",
                        shopOriginalTotal: "$$subOrder.shopOriginalTotal",
                        shopTaxes: "$$subOrder.shopTaxes",
                        shopShippingFees: "$$subOrder.shopShippingFees",
                        subOrderTotal: "$$subOrder.subOrderTotal",
                        status: "$$subOrder.status",
                        shippingStatus: "$$subOrder.shippingStatus"
                    }
                }
            }
        };

        // Build the aggregation pipeline
        const pipeline = [];
        if (filterObject) {
            pipeline.push({ $match: filterObject });
        }

        if (selectionObject) {
            const projection = { ...createProjection(selectionObject), ...subOrdersProjection };
            pipeline.push({ $project: projection });
        } else {
            pipeline.push({ $project: subOrdersProjection });
        }
        // Add sorting by issueDate
        pipeline.push({ $sort: { issueDate: -1 } });
        // Execute the aggregation pipeline
        const resultArray = await orderModel.aggregate(pipeline).exec();

        if (!resultArray || resultArray.length === 0) {
            return {
                success: false,
                code: 404,
                error: i18n.__("notFound")
            };
        }

        return {
            success: true,
            code: 200,
            result: resultArray
        };

    } catch (err) {
        console.error(`Error: ${err.message}`);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
};

exports.aggregateBySellers = async (filterObject, selectionObject) => {
    try {
        const normalizedQueryObjects = await prepareQueryObjects(filterObject, {});
        filterObject = normalizedQueryObjects.filterObject;
        if (Array.isArray(filterObject.sellers) && filterObject.sellers.length > 0) {
            filterObject.sellers = {
                $in: filterObject.sellers.map(id => new mongoose.Types.ObjectId(id))
            };
        }

        const createProjection = (selectionObj) => {
            return Object.entries(selectionObj).reduce((projection, [key, value]) => {
                if (typeof value === 'object') {
                    projection[key] = {
                        $map: {
                            input: `$${key}`,
                            as: "item",
                            in: createProjection(value)
                        }
                    };
                } else if (value) {
                    projection[key] = value;
                }
                return projection;
            }, {});
        };

        const subOrdersProjection = {
            subOrders: {
                $map: {
                    input: "$subOrders",
                    as: "subOrder",
                    in: {
                        seller: "$$subOrder.seller",
                        shop: "$$subOrder.shop",
                        shopTotal: "$$subOrder.shopTotal",
                        shopOriginalTotal: "$$subOrder.shopOriginalTotal",
                        shopTaxes: "$$subOrder.shopTaxes",
                        shopShippingFees: "$$subOrder.shopShippingFees",
                        subOrderTotal: "$$subOrder.subOrderTotal",
                        status: "$$subOrder.status",
                        shippingStatus: "$$subOrder.shippingStatus"
                    }
                }
            }
        };

        const pipeline = [];
        if (filterObject) {
            pipeline.push({ $match: filterObject });
        }

        if (selectionObject) {
            const projection = { ...createProjection(selectionObject), ...subOrdersProjection };
            pipeline.push({ $project: projection });
        } else {
            pipeline.push({ $project: subOrdersProjection });
        }

        pipeline.push({ $sort: { issueDate: -1 } });

        const resultArray = await orderModel.aggregate(pipeline).exec();

        if (!resultArray || resultArray.length === 0) {
            return {
                success: false,
                code: 404,
                error: i18n.__("notFound")
            };
        }

        return {
            success: true,
            code: 200,
            result: resultArray
        };

    } catch (err) {
        console.error(`Error: ${err.message}`);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
};

exports.aggregateAndPopulate = async (filterObject, selectionObject) => {
    try {
        const normalizedQueryObjects = await prepareQueryObjects(filterObject, {});
        filterObject = normalizedQueryObjects.filterObject;

        const createProjection = (selectionObj) => {
            return Object.entries(selectionObj).reduce((projection, [key, value]) => {
                if (typeof value === 'object') {
                    projection[key] = {
                        $map: {
                            input: `$${key}`,
                            as: "item",
                            in: createProjection(value)
                        }
                    };
                } else if (value) {
                    projection[key] = value;
                }
                return projection;
            }, {});
        };

        const subOrdersProjection = {
            subOrders: 1,
            orderType: 1,
            paymentMethod: 1,
            cartTotal: 1,
            cartOriginalTotal: 1,
            shippingFeesTotal: 1,
            taxesTotal: 1,
            orderTotal: 1,
            issueDate: 1,
            _id: 1
        };

        const pipeline = [];

        if (filterObject) pipeline.push({ $match: filterObject });

        pipeline.push({ $unwind: "$subOrders" });

        pipeline.push({
            $lookup: {
                from: "sellers",
                localField: "subOrders.seller",
                foreignField: "_id",
                as: "sellerDetails"
            }
        });

        pipeline.push({
            $lookup: {
                from: "shops",
                localField: "subOrders.shop",
                foreignField: "_id",
                as: "shopDetails"
            }
        });

        // Add a project stage to reshape the data after lookups
        pipeline.push({
            $project: {
                _id: 1,
                orderType: 1,
                paymentMethod: 1,
                cartTotal: 1,
                cartOriginalTotal: 1,
                shippingFeesTotal: 1,
                taxesTotal: 1,
                orderTotal: 1,
                issueDate: 1,
                subOrders: {
                    seller: {
                        _id: "$subOrders.seller",
                        userName: { $arrayElemAt: ["$sellerDetails.userName", 0] },
                        image: { $arrayElemAt: ["$sellerDetails.image", 0] }
                    },
                    shop: {
                        _id: "$subOrders.shop",
                        nameEn: { $arrayElemAt: ["$shopDetails.nameEn", 0] },
                        nameAr: { $arrayElemAt: ["$shopDetails.nameAr", 0] },
                        image: { $arrayElemAt: ["$shopDetails.image", 0] }
                    },
                    shopTotal: "$subOrders.shopTotal",
                    shopOriginalTotal: "$subOrders.shopOriginalTotal",
                    shopTaxes: "$subOrders.shopTaxes",
                    shopShippingFees: "$subOrders.shopShippingFees",
                    subOrderTotal: "$subOrders.subOrderTotal",
                    status: "$subOrders.status",
                    shippingStatus: "$subOrders.shippingStatus"
                }
            }
        });

        pipeline.push({
            $group: {
                _id: "$_id",
                orderType: { $first: "$orderType" },
                paymentMethod: { $first: "$paymentMethod" },
                cartTotal: { $first: "$cartTotal" },
                cartOriginalTotal: { $first: "$cartOriginalTotal" },
                shippingFeesTotal: { $first: "$shippingFeesTotal" },
                taxesTotal: { $first: "$taxesTotal" },
                orderTotal: { $first: "$orderTotal" },
                issueDate: { $first: "$issueDate" },
                subOrders: { $push: "$subOrders" }
            }
        });

        if (selectionObject) {
            const projection = { ...createProjection(selectionObject), ...subOrdersProjection };
            pipeline.push({ $project: projection });
        }

        pipeline.push({ $sort: { issueDate: -1 } });

        const resultArray = await orderModel.aggregate(pipeline).exec();

        if (!resultArray || resultArray.length === 0) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        return {
            success: true,
            code: 200,
            result: resultArray
        };

    } catch (err) {
        console.error(`Error: ${err.message}`);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
};

exports.count = async (filterObject, sortObject) => {
    try {
        let normalizedQueryObjects = await prepareQueryObjects(filterObject, sortObject)
        filterObject = normalizedQueryObjects.filterObject
        const count = await orderModel.count(filterObject);
        return {
            success: true,
            code: 200,
            result: count
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.create = async (formObject) => {
    try {

        const resultObject = new orderModel(formObject);
        await resultObject.save();

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }

        return {
            success: true,
            code: 201,
            result: resultObject,
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.update = async (_id, formObject) => {
    try {
        const existingObject = await this.find({ _id });
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        const resultObject = await orderModel.findByIdAndUpdate({ _id }, formObject, { new: true });

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };


        return {
            success: true,
            code: 200,
            result: resultObject
        };
    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
};


exports.updateDirectly = async (_id, formObject) => {
    try {
        const resultObject = await orderModel.findByIdAndUpdate({ _id }, formObject, { new: true })
        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        return {
            success: true,
            code: 200,
            result: resultObject
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.remove = async (_id) => {
    try {
        const resultObject = await orderModel.findByIdAndDelete({ _id })

        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        return {
            success: true,
            code: 200,
            result: { message: i18n.__("recordDeleted") }
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}
