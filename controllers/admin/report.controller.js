const i18n = require('i18n');
const moment = require('moment');
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
        countingResult.result.total = parseInt(countingResult.result.products.total) + countingResult.result.services;

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
                return order.status == "delivered"
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


exports.countOrders = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0;
        const sumByRange = true;
        delete req.query.sumByRange;

        let startDate, endDate;
        if (filterObject.dateFrom && filterObject.dateTo) {
            startDate = moment(filterObject.dateFrom).startOf('day');
            endDate = moment(filterObject.dateTo).endOf('day');
        }

        const orderSelectionObject = {
            orderType: 1, paymentMethod: 1, cartTotal: 1, cartOriginalTotal: 1,
            shippingFeesTotal: 1, taxesTotal: 1, orderTotal: 1, issueDate: 1
        };

        const serviceRequestSelectionObject = { status: 1, serviceTotal: 1, taxesTotal: 1, orderTotal: 1, issueDate: 1 };

        let allOrderDocuments = await getFilteredOrders(filterObject, orderSelectionObject)
        const allServiceRequests = await requestRepo.list({ ...filterObject, status: "purchased" }, serviceRequestSelectionObject, { issueDate: -1 }, pageNumber, limitNumber);

        const orderCountingFilters = [
            { label: "ordersFromFoodProducts", conditions: [{ fieldName: "orderType", fieldValue: "basket" }] },
            { label: "ordersFromNonFoodProducts", conditions: [{ fieldName: "orderType", fieldValue: "cart" }] },
        ];


        const overallCounts = countObjectsByArrayOfFilters(allOrderDocuments.result, orderCountingFilters);

        const salesData = calculateSales(allOrderDocuments.result, allServiceRequests.result);
        overallCounts.result.accumulations = {
            orders: {
                ordersFromFoodProducts: overallCounts.result.ordersFromFoodProducts,
                ordersFromNonFoodProducts: overallCounts.result.ordersFromNonFoodProducts,
                ordersFromAllProducts: overallCounts.result.ordersFromFoodProducts + overallCounts.result.ordersFromNonFoodProducts,
                ordersFromServiceRequests: allServiceRequests.count,
                totalOrders: allOrderDocuments.result.length + allServiceRequests.count
            },
            sales: salesData
        };

        delete overallCounts.result.ordersFromFoodProducts;
        delete overallCounts.result.ordersFromNonFoodProducts;
        delete overallCounts.result.total;

        if (!startDate || !endDate) {
            const sortedOrders = [...allOrderDocuments.result, ...allServiceRequests.result];
            startDate = moment(sortedOrders[sortedOrders.length - 1].issueDate).startOf('day');
            endDate = moment(sortedOrders[0].issueDate).endOf('day');
        }

        const daysDiff = endDate.diff(startDate, 'days');
        const { aggregationPeriod, periodCount } = getAggregationPeriodAndCount(daysDiff, sumByRange);

        const aggregations = {};
        let currentPeriodStart = moment(startDate);

        for (let i = 0; i < periodCount; i++) {
            let periodEnd = getPeriodEnd(currentPeriodStart, aggregationPeriod);
            if (periodEnd.isAfter(endDate)) {
                periodEnd = moment(endDate);
            }

            const { periodOrders, periodServiceRequests, periodCounts } = filterAndCountOrders(
                allOrderDocuments.result, allServiceRequests.result, currentPeriodStart, periodEnd, orderCountingFilters
            );

            const periodSalesAccumulations = calculateSales(periodOrders, periodServiceRequests);

            aggregations[currentPeriodStart.format('YYYY-MM-DD')] = {
                orders: {
                    ordersFromFoodProducts: periodCounts.result.ordersFromFoodProducts,
                    ordersFromNonFoodProducts: periodCounts.result.ordersFromNonFoodProducts,
                    ordersFromAllProducts: periodCounts.result.ordersFromFoodProducts + periodCounts.result.ordersFromNonFoodProducts,
                    ordersFromServiceRequests: periodServiceRequests.length,
                    totalOrders: periodOrders.length + periodServiceRequests.length
                },
                sales: periodSalesAccumulations
            };

            currentPeriodStart.add(1, aggregationPeriod);
        }

        overallCounts.result.aggregations = aggregations;
        overallCounts.result.dateRange = {
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
            aggregationPeriod: aggregationPeriod
        };

        return res.status(200).json({
            success: true,
            code: 200,
            result: overallCounts.result
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
            code: 500
        });
    }
};


async function getFilteredOrders(filterObject, orderSelectionObject) {
    let allOrderDocuments = await orderRepo.aggregate(filterObject, orderSelectionObject);
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


// Utility function to determine the aggregation period and period count
function getAggregationPeriodAndCount(daysDiff, sumByRange) {
    let aggregationPeriod, periodCount;
    if (sumByRange) {
        if (daysDiff <= 7) {
            aggregationPeriod = 'day';
            periodCount = 7;
        } else if (daysDiff > 7 && daysDiff <= 30) {
            aggregationPeriod = 'week';
            periodCount = 4;
        } else if (daysDiff > 30 && daysDiff <= 365) {
            aggregationPeriod = 'month';
            periodCount = Math.ceil(daysDiff / 30) + 1;
        } else {
            aggregationPeriod = 'year';
            periodCount = Math.ceil(daysDiff / 365) + 1;
        }
    } else {
        aggregationPeriod = 'day';
        periodCount = daysDiff + 1;
    }
    return { aggregationPeriod, periodCount };
}


// Utility function to get the period end date based on the aggregation period
function getPeriodEnd(currentPeriodStart, aggregationPeriod) {
    switch (aggregationPeriod) {
        case 'day':
            return moment(currentPeriodStart).add(1, 'days');
        case 'week':
            return moment(currentPeriodStart).add(7, 'days');
        case 'month':
            return moment(currentPeriodStart).add(30, 'days');
        case 'year':
            return moment(currentPeriodStart).add(365, 'days');
        default:
            return moment(currentPeriodStart).endOf(aggregationPeriod);
    }
}


// Utility function to filter and count orders by conditions
function filterAndCountOrders(orders, serviceRequests, currentPeriodStart, periodEnd, orderCountingFilters) {
    const periodOrders = orders.filter(order =>
        moment(order.issueDate).isBetween(currentPeriodStart, periodEnd, null, '[]')
    );
    const periodServiceRequests = serviceRequests.filter(request =>
        moment(request.issueDate).isBetween(currentPeriodStart, periodEnd, null, '[]')
    );

    const periodCounts = countObjectsByArrayOfFilters(periodOrders, orderCountingFilters);

    return { periodOrders, periodServiceRequests, periodCounts };
}


// Utility function to calculate sales
function calculateSales(periodOrders, periodServiceRequests) {
    const salesFromFoodProducts = periodOrders.reduce((total, order) => {
        return order.orderType === "basket" ? total + parseInt(order.orderTotal) : total;
    }, 0);

    const salesFromNonFoodProducts = periodOrders.reduce((total, order) => {
        return order.orderType === "cart" ? total + parseInt(order.orderTotal) : total;
    }, 0);

    const salesFromServiceRequests = periodServiceRequests.reduce((total, order) => total + parseInt(order.orderTotal), 0);

    return {
        salesFromFoodProducts,
        salesFromNonFoodProducts,
        salesFromAllProducts: salesFromFoodProducts + salesFromNonFoodProducts,
        salesFromServiceRequests,
        totalSales: salesFromFoodProducts + salesFromNonFoodProducts + salesFromServiceRequests
    };
}