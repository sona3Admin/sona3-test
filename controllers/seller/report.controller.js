const i18n = require('i18n');
const orderRepo = require("../../modules/Order/order.repo");
const requestRepo = require("../../modules/Request/request.repo");
const productRepo = require('../../modules/Product/product.repo');
const serviceRepo = require('../../modules/Service/service.repo');
const { groupByCategories } = require('../admin/report.controller');


exports.countProducts = async (req, res) => {
    try {
        const { query: filterObject, body: { filters: queryObject } } = req;
        const pageNumber = req.query.page || 1;
        const limitNumber = req.query.limit || 0;
        const allDocuments = await productRepo.list(
            { ...filterObject, isDeleted: false },
            { isActive: 1, isVerified: 1, isFood: 1, creationDate: 1 },
            {}, pageNumber, limitNumber
        );

        let countingResults = {};
        const filterCategories = ['isActive', 'isVerified', 'isFood'];
        const categoryMap = { isActive: 'active', isVerified: 'verified', isFood: 'food' };

        countingResults = groupByCategories(queryObject, filterCategories, categoryMap, allDocuments)

        return res.status(200).json({
            success: true,
            code: 200,
            result: countingResults
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


exports.countServices = async (req, res) => {
    try {
        const { query: filterObject, body: { filters: queryObject } } = req;
        const pageNumber = req.query.page || 1;
        const limitNumber = req.query.limit || 0;
        const allDocuments = await serviceRepo.list(
            { ...filterObject, isDeleted: false },
            { isActive: 1, isVerified: 1, creationDate: 1 },
            {}, pageNumber, limitNumber
        );

        let countingResults = {};
        const filterCategories = ['isActive', 'isVerified'];
        const categoryMap = { isActive: 'active', isVerified: 'verified' };

        countingResults = groupByCategories(queryObject, filterCategories, categoryMap, allDocuments)

        return res.status(200).json({
            success: true,
            code: 200,
            result: countingResults
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











exports.countOrders = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        const overallCounts = { orders: 0, grossSales: 0, netSales: 0 }
        let allOrderDocuments = await orderRepo.list(
            { sellers: req.query.seller, ...filterObject },
            { customer: 1, subOrders: 1, shippingAddress: 1, paymentMethod: 1, issueDate: 1 },
            {}, pageNumber, limitNumber
        )

        allOrderDocuments = getFlattedOrders(allOrderDocuments)
        overallCounts.orders = allOrderDocuments.result.length

        let grossSales = allOrderDocuments.result.reduce((total, order) => total + parseInt(order.shopTotal), 0);
        overallCounts.grossSales = grossSales

        let netSales = allOrderDocuments.result.reduce((total, order) => total + (parseInt(order.shopTotal) * 0.85), 0);
        overallCounts.netSales = netSales

        return res.status(200).json({
            success: true,
            code: 200,
            result: overallCounts
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
            code: 500
        });
    }
};


exports.countRequests = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
        const overallCounts = { requests: 0, grossSales: 0, netSales: 0 }
        
        let allRequestDocuments = await requestRepo.list(
            { seller: req.query.seller, status: "purchased", ...filterObject },
            { status: 1, serviceTotal: 1, taxesTotal: 1, orderTotal: 1, issueDate: 1 },
            {}, pageNumber, limitNumber
        )
        overallCounts.requests = allRequestDocuments.result.length

        let grossSales = allRequestDocuments.result.reduce((total, request) => total + parseInt(request.serviceTotal), 0);
        overallCounts.grossSales = grossSales
        overallCounts.netSales = grossSales

        return res.status(200).json({
            success: true,
            code: 200,
            result: overallCounts
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
            code: 500
        });
    }
};


function getFlattedOrders(allOrderDocuments) {
    if (!allOrderDocuments.result) return { success: true, code: 200, result: [] }
    allOrderDocuments.result = allOrderDocuments.result.flatMap(order =>
        order.subOrders.map(subOrder => ({
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
    allOrderDocuments.result = allOrderDocuments?.result?.filter((order) => order.status === "delivered");
    return allOrderDocuments
}
