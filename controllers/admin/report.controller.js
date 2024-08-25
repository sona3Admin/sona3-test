const i18n = require('i18n');
const customerRepo = require("../../modules/Customer/customer.repo");
const sellerRepo = require("../../modules/Seller/seller.repo");
const shopRepo = require("../../modules/Shop/shop.repo");
const productRepo = require("../../modules/Product/product.repo");
const serviceRepo = require("../../modules/Service/service.repo");
const orderRepo = require("../../modules/Order/order.repo");
const requestRepo = require("../../modules/Request/request.repo");
const paymentRepo = require("../../modules/Payment/payment.repo");
const { countObjectsByArrayOfFilters } = require("../../helpers/report.helper")


exports.countCustomers = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        const allDocuments = await customerRepo.list(filterObject, { isActive: 1, hasPurchased: 1 }, {}, pageNumber, limitNumber);
        const countingFilters = [
            { label: "active", conditions: [{ fieldName: "isActive", fieldValue: true }] },
            { label: "inactive", conditions: [{ fieldName: "isActive", fieldValue: false }] },
            { label: "hasPurchased", conditions: [{ fieldName: "hasPurchased", fieldValue: true }] },
            { label: "noPurchase", conditions: [{ fieldName: "hasPurchased", fieldValue: false }] },
        ];
        const countingResult = countObjectsByArrayOfFilters(allDocuments.result, countingFilters)

        return res.status(countingResult.code).json(countingResult);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.countSellers = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        const allDocuments = await sellerRepo.list(filterObject, { isActive: 1, isSubscribed: 1 }, {}, pageNumber, limitNumber);
        const countingFilters = [
            { label: "active", conditions: [{ fieldName: "isActive", fieldValue: true }] },
            { label: "inactive", conditions: [{ fieldName: "isActive", fieldValue: false }] },
            { label: "subscribed", conditions: [{ fieldName: "isSubscribed", fieldValue: true }] },
            { label: "unsubscribed", conditions: [{ fieldName: "isSubscribed", fieldValue: false }] },
        ];
        const countingResult = countObjectsByArrayOfFilters(allDocuments.result, countingFilters)

        return res.status(countingResult.code).json(countingResult);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.countShops = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        const allDocuments = await shopRepo.list(filterObject, { isVerified: 1, isFood: 1, type: 1 }, {}, pageNumber, limitNumber);
        const countingFilters = [
            { label: "verified", conditions: [{ fieldName: "isVerified", fieldValue: true }] },
            { label: "unverified", conditions: [{ fieldName: "isVerified", fieldValue: false }] },
            { label: "productShops", conditions: [{ fieldName: "type", fieldValue: "product" }] },
            {
                label: "foodShops", conditions: [
                    { fieldName: "isFood", fieldValue: true },
                    { fieldName: "type", fieldValue: "product" }
                ]
            },
            {
                label: "nonFoodShops", conditions: [
                    { fieldName: "isFood", fieldValue: false },
                    { fieldName: "type", fieldValue: "product" }
                ]
            },
            { label: "serviceShops", conditions: [{ fieldName: "type", fieldValue: "service" }] },

        ];
        const countingResult = countObjectsByArrayOfFilters(allDocuments.result, countingFilters)

        countingResult.result.productShops = {
            foodShops: countingResult.result.foodShops,
            nonFoodShops: countingResult.result.nonFoodShops,
            total: countingResult.result.productShops
        };
        delete countingResult.result.foodShops;
        delete countingResult.result.nonFoodShops;

        return res.status(countingResult.code).json(countingResult);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.countItems = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        const allProductDocuments = await productRepo.list({ ...filterObject, isActive: true }, { isFood: 1 }, {}, pageNumber, limitNumber);
        const allServiceDocuments = await serviceRepo.count({ ...filterObject, isActive: true }, {});
        const countingFilters = [
            { label: "foodProducts", conditions: [{ fieldName: "isFood", fieldValue: true }] },
            { label: "nonFoodProducts", conditions: [{ fieldName: "isFood", fieldValue: false }] },
        ];
        const countingResult = countObjectsByArrayOfFilters(allProductDocuments.result, countingFilters)

        countingResult.result.products = {
            foodProducts: countingResult.result.foodProducts,
            nonFoodProducts: countingResult.result.nonFoodProducts,
            total: parseInt(countingResult.result.foodProducts) + parseInt(countingResult.result.nonFoodProducts)
        };
        delete countingResult.result.foodProducts;
        delete countingResult.result.nonFoodProducts;

        countingResult.result.services = parseInt(allServiceDocuments.result);
        countingResult.result.total = countingResult.result.products.food +
            countingResult.result.products.nonFood +
            countingResult.result.services;

        return res.status(countingResult.code).json(countingResult);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.countOrders = async (req, res) => {
    try {
        const filterObject = req.query;
        // if (!filterObject.dateField) {
        //     const today = new Date(); 
        //     const sevenDaysAgo = new Date(today);
        //     sevenDaysAgo.setDate(today.getDate() - 7);
        //     filterObject.dateField = "issueDate"
        //     filterObject.dateFrom = sevenDaysAgo;
        //     filterObject.dateTo = today
        // }
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        const orderSelectionObject = {
            orderType: 1,
            paymentMethod: 1,
            cartTotal: 1,
            cartOriginalTotal: 1,
            shippingFeesTotal: 1,
            taxesTotal: 1,
            orderTotal: 1,
            issueDate: 1
        }
        const serviceRequestSelectionObject = {
            status: 1,
            serviceTotal: 1,
            taxesTotal: 1,
            orderTotal: 1,
            issueDate: 1
        }
        let allOrderDocuments = await orderRepo.aggregate(filterObject, orderSelectionObject)
        allOrderDocuments.result = allOrderDocuments.result.flatMap(order =>
            order.subOrders.map(subOrder => ({
                _id: order._id,
                paymentMethod: order.paymentMethod,
                cartTotal: order.cartTotal,
                cartOriginalTotal: order.cartOriginalTotal,
                shippingFeesTotal: order.shippingFeesTotal,
                taxesTotal: order.taxesTotal,
                orderTotal: order.orderTotal,
                orderType: order.orderType,
                issueDate: order.issueDate,
                ...subOrder
            }))
        );
        const orderCountingFilters = [
            { label: "ordersFromFoodProducts", conditions: [{ fieldName: "orderType", fieldValue: "basket" }] },
            { label: "ordersFromNonFoodProducts", conditions: [{ fieldName: "orderType", fieldValue: "cart" }] },
        ];
        const countingResult = countObjectsByArrayOfFilters(allOrderDocuments.result, orderCountingFilters)
        const allServiceRequests = await requestRepo.list(filterObject, serviceRequestSelectionObject, { issueDate: -1 }, pageNumber, limitNumber);
        countingResult.result.ordersFromServiceRequests = parseInt(allServiceRequests.count);
        countingResult.result.total = parseInt(allOrderDocuments.result.length) + parseInt(allServiceRequests.count);;

        return res.status(countingResult.code).json(countingResult);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.calculateRevenue = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        let orderTotal = 0
        let subscriptionFees = 0
        const orderSelectionObject = {
            orderType: 1,
            paymentMethod: 1,
        }
        let allOrderDocuments = await orderRepo.aggregate(filterObject, orderSelectionObject)
        console.log("allOrderDocuments", allOrderDocuments)
        if (allOrderDocuments.success) {
            allOrderDocuments.result = allOrderDocuments?.result?.flatMap(order =>
                order?.subOrders?.map(subOrder => ({
                    paymentMethod: order.paymentMethod,
                    ...subOrder
                }))
            );
            allOrderDocuments.result = allOrderDocuments?.result?.filter((order) => {
                return order.status == "pending" || order.status == "in progress" || order.status == "delivered"
            })
            orderTotal = allOrderDocuments.result.reduce((total, order) => parseFloat(total) + parseFloat(order.shopTotal), 0);

        }

        const commissions = parseInt(orderTotal * 0.10) || 0

        if (filterObject.dateField) filterObject.dateField = "timestamp"

        const allSubscriptionPayments = await paymentRepo.list({ ...filterObject, orderType: "subscription" }, { subscriptionFees: 1 }, {}, pageNumber, limitNumber);
        if (allSubscriptionPayments.success) subscriptionFees = allSubscriptionPayments.result.reduce((total, payment) => parseFloat(total) + parseFloat(payment.subscriptionFees), 0);

        return res.status(200).json({
            total: parseInt(commissions + subscriptionFees),
            subscriptionFees: parseInt(subscriptionFees),
            commissions
        });

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}