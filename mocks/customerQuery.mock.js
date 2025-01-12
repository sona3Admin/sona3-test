const i18n = require('i18n');
const sellerModel = require("../modules/Seller/seller.model")
const customerModel = require("../modules/Customer/customer.model")
const categoryModel = require("../modules/Category/category.model");
const orderModel = require("../modules/Order/order.model");
const serviceModel = require("../modules/Service/service.model");
const requestModel = require("../modules/Request/request.model");
const orderRepo = require('../modules/Order/order.repo');
const requestRepo = require('../modules/Request/request.repo');
const moment = require("moment");
const variationModel = require('../modules/Variation/variation.model');
const shopModel = require('../modules/Shop/shop.model');


// exports.executeQuery = async (req, res) => {
//     try {
//         const filterObject = req.query;
//         const orderSelectionObject = {
//             orderType: 1, paymentMethod: 1, cartTotal: 1, cartOriginalTotal: 1,
//             shippingFeesTotal: 1, taxesTotal: 1, orderTotal: 1, issueDate: 1, _id: 1
//         };

//         const allOrderDocuments = await orderRepo.aggregate(filterObject, orderSelectionObject);

//         if (!allOrderDocuments.result) return res.status(200).json({ success: true, result: [] });


//         const deliveredOrders = [];
//         for (const order of allOrderDocuments.result) {
//             for (const subOrder of order.subOrders) {
//                 if (subOrder.status === "delivered") deliveredOrders.push({
//                     paymentMethod: order.paymentMethod,
//                     cartTotal: order.cartTotal,
//                     cartOriginalTotal: order.cartOriginalTotal,
//                     shippingFeesTotal: order.shippingFeesTotal,
//                     taxesTotal: order.taxesTotal,
//                     orderTotal: order.orderTotal,
//                     orderType: order.orderType,
//                     issueDate: order.issueDate,
//                     _id: order._id?.toString(),
//                     ...subOrder
//                 });

//             }
//         }

//         const accumulations = {
//             orders: {
//                 totalOrderCount: deliveredOrders.length,
//                 totalDaysOfOrders: 0,
//                 ordersFromFoodProducts: 0,
//                 ordersFromNonFoodProducts: 0,
//                 ordersFromAllProducts: 0
//             },
//             sales: {
//                 totalSales: 0,
//                 salesFromFoodProducts: 0,
//                 salesFromNonFoodProducts: 0,
//                 salesFromAllProducts: 0
//             }
//         };

//         const issueDateCounts = new Map();

//         for (const order of deliveredOrders) {
//             const date = new Date(order.issueDate);
//             date.setHours(0, 0, 0, 0);
//             const dateString = date.toISOString().split("T")[0];

//             if (!issueDateCounts.has(dateString)) issueDateCounts.set(dateString, {
//                 orderCount: 0,
//                 totalSales: 0,
//                 ordersFromFoodProducts: 0,
//                 ordersFromNonFoodProducts: 0,
//                 salesFromFoodProducts: 0,
//                 salesFromNonFoodProducts: 0,
//                 sellersOfTheDay: new Map()
//             });


//             const dailyAggregation = issueDateCounts.get(dateString);

//             // Update daily counts and sales
//             dailyAggregation.orderCount++;
//             dailyAggregation.totalSales += order.orderTotal;

//             if (order.orderType === "basket") {
//                 dailyAggregation.ordersFromFoodProducts++;
//                 dailyAggregation.salesFromFoodProducts += order.orderTotal;
//             } else if (order.orderType === "cart") {
//                 dailyAggregation.ordersFromNonFoodProducts++;
//                 dailyAggregation.salesFromNonFoodProducts += order.orderTotal;
//             }

//             // Sellers of the day logic
//             const sellerShopKey = `${order.seller}-${order.shop}`;
//             if (!dailyAggregation.sellersOfTheDay.has(sellerShopKey)) {
//                 dailyAggregation.sellersOfTheDay.set(sellerShopKey, {
//                     seller: order.seller.toString(),
//                     shop: order.shop.toString(),
//                     orderType: order.orderType,
//                     orderCount: 1,
//                     totalSales: order.orderTotal
//                 });
//             } else {
//                 const sellerShopEntry = dailyAggregation.sellersOfTheDay.get(sellerShopKey);
//                 sellerShopEntry.orderCount++;
//                 sellerShopEntry.totalSales += order.orderTotal;
//             }

//             // Accumulate overall statistics
//             accumulations.sales.totalSales += order.orderTotal;
//             if (order.orderType === "basket") {
//                 accumulations.orders.ordersFromFoodProducts++;
//                 accumulations.sales.salesFromFoodProducts += order.orderTotal;
//             } else if (order.orderType === "cart") {
//                 accumulations.orders.ordersFromNonFoodProducts++;
//                 accumulations.sales.salesFromNonFoodProducts += order.orderTotal;
//             }
//         }

//         // Convert Map to Array for JSON response
//         const issueDatesWithCounts = Array.from(issueDateCounts.entries()).map(([date, data]) => ({
//             issueDate: date,
//             orderCount: data.orderCount,
//             totalSales: parseFloat(data.totalSales.toFixed(2)),
//             ordersFromFoodProducts: data.ordersFromFoodProducts,
//             ordersFromNonFoodProducts: data.ordersFromNonFoodProducts,
//             salesFromFoodProducts: parseFloat(data.salesFromFoodProducts.toFixed(2)),
//             salesFromNonFoodProducts: parseFloat(data.salesFromNonFoodProducts.toFixed(2)),
//             sellersOfTheDay: Array.from(data.sellersOfTheDay.values())
//         }));

//         // Final accumulations
//         accumulations.orders.totalDaysOfOrders = issueDateCounts.size;
//         accumulations.orders.ordersFromAllProducts = accumulations.orders.ordersFromFoodProducts +
//             accumulations.orders.ordersFromNonFoodProducts;
//         accumulations.sales.salesFromAllProducts = parseFloat(
//             (accumulations.sales.salesFromFoodProducts + accumulations.sales.salesFromNonFoodProducts).toFixed(2)
//         );

//         return res.status(200).json({
//             success: true,
//             accumulations,
//             aggregations: issueDatesWithCounts
//         });
//     } catch (err) {
//         console.error(`Error in executeQuery: ${err.message}`);
//         return res.status(500).json({
//             success: false,
//             code: 500,
//             error: i18n.__("internalServerError")
//         });
//     }
// };


exports.executeQuery = async (req, res) => {
    try {
        await shopModel.updateMany({}, { $set: { orderCount: 0 } });
        return res.status(200).json({ success: true });
    }
    catch (err) {
        console.error(`Error in executeQuery: ${err.message}`);
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


// Helper to calculate start of time unit
const calculateTimeSlot = (date, unit) => {
    switch (unit) {
        case "weekly":
            return moment(date).startOf("isoWeek").toISOString();
        case "monthly":
            return moment(date).startOf("month").toISOString();
        case "quarterly":
            return moment(date).startOf("quarter").toISOString();
        case "semi-annually":
            return moment(date).month() < 6
                ? moment(date).startOf("year").toISOString()
                : moment(date).startOf("year").add(6, "months").toISOString();
        case "yearly":
            return moment(date).startOf("year").toISOString();
        default: // daily
            return moment(date).startOf("day").toISOString();
    }
};