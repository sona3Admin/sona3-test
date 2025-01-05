const i18n = require('i18n');
const sellerModel = require("../modules/Seller/seller.model")
const customerModel = require("../modules/Customer/customer.model")
const categoryModel = require("../modules/Category/category.model");
const orderModel = require("../modules/Order/order.model");
const serviceModel = require("../modules/Service/service.model");
const requestModel = require("../modules/Request/request.model");
const orderRepo = require('../modules/Order/order.repo');
const requestRepo = require('../modules/Request/request.repo');




exports.executeQuery = async (req, res) => {
    try {
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0;
        const filterObject = {};
        const serviceRequestSelectionObject = { status: 1, serviceTotal: 1, taxesTotal: 1, orderTotal: 1, issueDate: 1, seller: 1, shop: 1 };
        await requestModel.updateMany({ orderTotal: undefined }, { orderTotal: 150, taxesTotal: 15 })
        const allServiceRequests = await requestRepo.list({ ...filterObject, status: "purchased" }, serviceRequestSelectionObject, { issueDate: -1 }, pageNumber, limitNumber);
        if (!allServiceRequests.result) return { success: true, code: 200, result: [] };
        // const numberOfDeliveredRequests = allServiceRequests.result.length;


        const accumulations = {
            orders: {
                totalOrderCount: 0,
                totalDaysOfOrders: 0,
            },
            sales: {
                totalSales: 0,
            }
        };

        const issueDateCounts = allServiceRequests.result.reduce((acc, order) => {
            const date = new Date(order.issueDate);
            date.setHours(0, 0, 0, 0);

            const dateString = date.toISOString().split('T')[0];

            if (!acc[dateString]) {
                acc[dateString] = {
                    orderCount: 0,
                    totalSales: 0,
                    sellersOfTheDay: []
                };
            }

            acc[dateString].orderCount++;
            acc[dateString].totalSales += order.orderTotal;

            let sellerShopEntry = acc[dateString].sellersOfTheDay.find(
                entry => entry.seller === order.seller._id.toString() && entry.shop === order.shop._id.toString()
            );

            if (sellerShopEntry) {
                sellerShopEntry.orderCount += 1;
                // sellerShopEntry.orders.push(order._id.toString());
            } else {
                acc[dateString].sellersOfTheDay.push({
                    seller: order.seller._id.toString(),
                    shop: order.shop._id.toString(),
                    orderType: order.orderType, // Add orderType field here
                    orderCount: 1,
                    // orders: [order._id.toString()]
                });
            }

            // Accumulate overall statistics
            accumulations.orders.totalOrderCount++;
            accumulations.sales.totalSales += parseFloat(order.orderTotal.toFixed(2));

            return acc;
        }, {});

        accumulations.orders.totalDaysOfOrders = Object.keys(issueDateCounts).length;
        const issueDatesWithCounts = Object.keys(issueDateCounts).map(date => ({
            issueDate: date,
            orderCount: issueDateCounts[date].orderCount,
            totalSales: parseFloat(issueDateCounts[date].totalSales.toFixed(2)),
            sellersOfTheDay: issueDateCounts[date].sellersOfTheDay
        }));

        return res.status(200).json({
            success: true,
            accumulations,
            aggregations: issueDatesWithCounts
        });

    } catch (err) {
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
};


exports.getOrderStats = async (req, res) => {
    try {
        const filterObject = {};
        const orderSelectionObject = {
            orderType: 1, paymentMethod: 1, cartTotal: 1, cartOriginalTotal: 1,
            shippingFeesTotal: 1, taxesTotal: 1, orderTotal: 1, issueDate: 1, _id: 1
        };

        let allOrderDocuments = await orderRepo.aggregate(filterObject, orderSelectionObject);

        if (!allOrderDocuments.result) return { success: true, code: 200, result: [] };

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
                _id: order._id?.toString(),  // Include order ID
                ...subOrder
            }))
        );

        allOrderDocuments.result = allOrderDocuments.result.filter((order) => order.status === "delivered");
        const numberOfDeliveredOrders = allOrderDocuments.result.length;

        // Group by issueDate and count the number of orders for each date
        const issueDateCounts = allOrderDocuments.result.reduce((acc, order) => {
            const date = new Date(order.issueDate);
            date.setHours(0, 0, 0, 0);

            const dateString = date.toISOString().split('T')[0];

            if (acc[dateString]) {
                acc[dateString].orderCount += 1;
                acc[dateString].orders.push(order._id.toString()); // Add order ID to the list
            } else {
                acc[dateString] = {
                    orderCount: 1,
                    orders: [order._id.toString()],
                    sellersOfTheDay: [] // Initialize sellers for this day
                };
            }

            // Group by seller and shop for each day
            const sellerShopKey = `${order.seller.toString()}_${order.shop.toString()}`;
            let sellerShopEntry = acc[dateString].sellersOfTheDay.find(entry => entry.seller === order.seller.toString() && entry.shop === order.shop.toString());

            if (sellerShopEntry) {
                sellerShopEntry.orderCount += 1;
                sellerShopEntry.orders.push(order._id.toString()); // Add order ID to the seller-shop entry
            } else {
                acc[dateString].sellersOfTheDay.push({
                    seller: order.seller.toString(),
                    shop: order.shop.toString(),
                    orderCount: 1,
                    orders: [order._id.toString()] // Initialize with the first order ID
                });
            }

            return acc;
        }, {});

        // Convert the grouped results into the final structure for `resultByDate`
        const issueDatesWithCounts = Object.keys(issueDateCounts).map(date => ({
            issueDate: date,
            orderCount: issueDateCounts[date].orderCount,
            sellersOfTheDay: issueDateCounts[date].sellersOfTheDay
        }));

        return res.status(200).json({
            success: true,
            numberOfDeliveredOrders,
            resultByDate: issueDatesWithCounts,
            totalDatesOfOrders: issueDatesWithCounts.length
        });

    } catch (err) {
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
};


exports.getServiceRequestStats = async (req, res) => {
    try {
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0;
        const filterObject = {};
        const serviceRequestSelectionObject = { status: 1, serviceTotal: 1, taxesTotal: 1, orderTotal: 1, issueDate: 1, seller: 1, shop: 1 };

        const allServiceRequests = await requestRepo.list({ ...filterObject, status: "purchased" }, serviceRequestSelectionObject, { issueDate: -1 }, pageNumber, limitNumber);
        if (!allServiceRequests.result) return { success: true, code: 200, result: [] };
        const numberOfDeliveredRequests = allServiceRequests.result.length;


        // Group by issueDate and count the number of orders for each date
        const issueDateCounts = allServiceRequests.result.reduce((acc, request) => {
            const date = new Date(request.issueDate);
            date.setHours(0, 0, 0, 0);

            const dateString = date.toISOString().split('T')[0];

            if (acc[dateString]) {
                acc[dateString].requestCount += 1;
                acc[dateString].requests.push(request._id.toString()); // Add request ID to the list
            } else {
                acc[dateString] = {
                    requestCount: 1,
                    requests: [request._id.toString()],
                    sellersOfTheDay: [] // Initialize sellers for this day
                };
            }

            // Group by seller and shop for each day
            const sellerShopKey = `${request.seller._id.toString()}_${request.shop._id.toString()}`;
            let sellerShopEntry = acc[dateString].sellersOfTheDay.find(entry => entry.seller === request.seller._id.toString() && entry.shop === request.shop._id.toString());

            if (sellerShopEntry) {
                sellerShopEntry.requestCount += 1;
                sellerShopEntry.requests.push(request._id.toString()); // Add request ID to the seller-shop entry
            } else {
                acc[dateString].sellersOfTheDay.push({
                    seller: request.seller._id.toString(),
                    shop: request.shop._id.toString(),
                    requestCount: 1,
                    requests: [request._id.toString()] // Initialize with the first request ID
                });
            }

            return acc;
        }, {});

        // Convert the grouped results into the final structure for `resultByDate`
        const issueDatesWithCounts = Object.keys(issueDateCounts).map(date => ({
            issueDate: date,
            requestCount: issueDateCounts[date].requestCount,
            sellersOfTheDay: issueDateCounts[date].sellersOfTheDay
        }));

        return res.status(200).json({
            success: true,
            numberOfDeliveredRequests,
            resultByDate: issueDatesWithCounts,
            totalDatesOfRequests: issueDatesWithCounts.length,

        });

    } catch (err) {
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
};


