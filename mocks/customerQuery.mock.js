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



const getMonthKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};


exports.executeQuery = async (req, res) => {
    try {
        console.log("getOrdersStatsByMonth")
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0;
        const filterObject = {};
        const serviceRequestSelectionObject = { status: 1, serviceTotal: 1, taxesTotal: 1, orderTotal: 1, issueDate: 1, seller: 1, shop: 1 };
        const allServiceRequests = await requestRepo.list({ ...filterObject, status: "purchased" }, serviceRequestSelectionObject, { issueDate: -1 }, pageNumber, limitNumber);
        if (!allServiceRequests.result) return { success: true, code: 200, result: [] };
        // const numberOfDeliveredRequests = allServiceRequests.result.length;


        // Initialize aggregation object
        const monthlyAggregations = {};
        let minDate = null;
        let maxDate = null;

        // Group orders by month
        allServiceRequests.result.forEach(order => {
            const orderDate = new Date(order.issueDate);
            const monthKey = getMonthKey(orderDate);

            if (!minDate || orderDate < minDate) minDate = new Date(orderDate);
            if (!maxDate || orderDate > maxDate) maxDate = new Date(orderDate);

            if (!monthlyAggregations[monthKey]) {
                monthlyAggregations[monthKey] = {
                    issueDate: monthKey,
                    orderCount: 0,
                    totalSales: 0,
                    sellersOfTheDay: []
                };
            }

            const month = monthlyAggregations[monthKey];
            month.orderCount++;
            month.totalSales += order.orderTotal;


            // Update sellers
            let sellerEntry = month.sellersOfTheDay.find(
                entry => entry.seller === order.seller._id.toString() && entry.shop === order.shop._id.toString()
            );

            if (sellerEntry) {
                sellerEntry.orderCount++;
                sellerEntry.totalSales += order.orderTotal;
            } else {
                month.sellersOfTheDay.push({
                    seller: order.seller._id.toString(),
                    shop: order.shop._id.toString(),
                    orderCount: 1,
                    totalSales: order.orderTotal
                });
            }
        });

        // Fill in missing months
        if (minDate && maxDate) {
            let currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
            const endDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1);

            while (currentDate < endDate) {
                const monthKey = getMonthKey(currentDate);

                if (!monthlyAggregations[monthKey]) {
                    monthlyAggregations[monthKey] = {
                        issueDate: monthKey,
                        orderCount: 0,
                        totalSales: 0,
                        sellersOfTheMonth: []
                    };
                }

                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }

        // Calculate accumulations
        const accumulations = {
            orders: {
                totalOrderCount: 0,
                totalMonthsOfOrders: Object.keys(monthlyAggregations).length,
            },
            sales: {
                totalSales: 0,
            }
        };

        // Convert monthlyAggregations to array and calculate accumulations
        const aggregations = Object.values(monthlyAggregations)
            .sort((a, b) => a.issueDate.localeCompare(b.issueDate))
            .map(month => {
                // Update accumulations
                accumulations.orders.totalOrderCount += month.orderCount;
                accumulations.sales.totalSales += month.totalSales;

                return {
                    ...month,
                    totalSales: parseFloat(month.totalSales.toFixed(2)),
                };
            });


        accumulations.sales.totalSales = parseFloat(accumulations.sales.totalSales.toFixed(2));

        return res.status(200).json({
            success: true,
            accumulations,
            aggregations
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




// exports.executeQuery = async (req, res) => {
//     try {
//         const filterObject = req.query;
//         const orderSelectionObject = {
//             orderType: 1,
//             paymentMethod: 1,
//             cartTotal: 1,
//             cartOriginalTotal: 1,
//             shippingFeesTotal: 1,
//             taxesTotal: 1,
//             orderTotal: 1,
//             issueDate: 1,
//             _id: 1
//         };

//         let allOrderDocuments = await orderRepo.aggregate(filterObject, orderSelectionObject);

//         if (!allOrderDocuments.result) return res.status(200).json({ success: true, result: [] });

//         // Flatten and filter orders
//         allOrderDocuments.result = allOrderDocuments.result.flatMap(order =>
//             order.subOrders.map(subOrder => ({
//                 paymentMethod: order.paymentMethod,
//                 cartTotal: order.cartTotal,
//                 cartOriginalTotal: order.cartOriginalTotal,
//                 shippingFeesTotal: order.shippingFeesTotal,
//                 taxesTotal: order.taxesTotal,
//                 orderTotal: order.orderTotal,
//                 orderType: order.orderType,
//                 issueDate: order.issueDate,
//                 _id: order._id?.toString(),
//                 ...subOrder
//             }))
//         ).filter((order) => order.status === "delivered");

//         // Initialize aggregation object
//         const monthlyAggregations = {};
//         let minDate = null;
//         let maxDate = null;

//         // Group orders by month
//         allOrderDocuments.result.forEach(order => {
//             const orderDate = new Date(order.issueDate);
//             const monthKey = getMonthKey(orderDate);

//             if (!minDate || orderDate < minDate) minDate = new Date(orderDate);
//             if (!maxDate || orderDate > maxDate) maxDate = new Date(orderDate);

//             if (!monthlyAggregations[monthKey]) {
//                 monthlyAggregations[monthKey] = {
//                     issueDate: monthKey,
//                     orderCount: 0,
//                     totalSales: 0,
//                     ordersFromFoodProducts: 0,
//                     ordersFromNonFoodProducts: 0,
//                     salesFromFoodProducts: 0,
//                     salesFromNonFoodProducts: 0,
//                     sellersOfTheDay: []
//                 };
//             }

//             const month = monthlyAggregations[monthKey];
//             month.orderCount++;
//             month.totalSales += order.orderTotal;

//             if (order.orderType === "basket") {
//                 month.ordersFromFoodProducts++;
//                 month.salesFromFoodProducts += order.orderTotal;
//             } else if (order.orderType === "cart") {
//                 month.ordersFromNonFoodProducts++;
//                 month.salesFromNonFoodProducts += order.orderTotal;
//             }

//             // Update sellers
//             let sellerEntry = month.sellersOfTheDay.find(
//                 entry => entry.seller === order.seller.toString() && entry.shop === order.shop.toString()
//             );

//             if (sellerEntry) {
//                 sellerEntry.orderCount++;
//                 sellerEntry.totalSales += order.orderTotal;
//             } else {
//                 month.sellersOfTheDay.push({
//                     seller: order.seller.toString(),
//                     shop: order.shop.toString(),
//                     orderType: order.orderType,
//                     orderCount: 1,
//                     totalSales: order.orderTotal
//                 });
//             }
//         });

//         // Fill in missing months
//         if (minDate && maxDate) {
//             let currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
//             const endDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1);

//             while (currentDate < endDate) {
//                 const monthKey = getMonthKey(currentDate);

//                 if (!monthlyAggregations[monthKey]) {
//                     monthlyAggregations[monthKey] = {
//                         issueDate: monthKey,
//                         orderCount: 0,
//                         totalSales: 0,
//                         ordersFromFoodProducts: 0,
//                         ordersFromNonFoodProducts: 0,
//                         salesFromFoodProducts: 0,
//                         salesFromNonFoodProducts: 0,
//                         sellersOfTheDay: []
//                     };
//                 }

//                 currentDate.setMonth(currentDate.getMonth() + 1);
//             }
//         }

//         // Calculate accumulations
//         const accumulations = {
//             orders: {
//                 totalOrderCount: 0,
//                 totalDaysOfOrders: Object.keys(monthlyAggregations).length,
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

//         // Convert monthlyAggregations to array and calculate accumulations
//         const aggregations = Object.values(monthlyAggregations)
//             .sort((a, b) => a.issueDate.localeCompare(b.issueDate))
//             .map(month => {
//                 // Update accumulations
//                 accumulations.orders.totalOrderCount += month.orderCount;
//                 accumulations.orders.ordersFromFoodProducts += month.ordersFromFoodProducts;
//                 accumulations.orders.ordersFromNonFoodProducts += month.ordersFromNonFoodProducts;
//                 accumulations.sales.totalSales += month.totalSales;
//                 accumulations.sales.salesFromFoodProducts += month.salesFromFoodProducts;
//                 accumulations.sales.salesFromNonFoodProducts += month.salesFromNonFoodProducts;

//                 // Format numbers for the month
//                 return {
//                     ...month,
//                     totalSales: parseFloat(month.totalSales.toFixed(2)),
//                     salesFromFoodProducts: parseFloat(month.salesFromFoodProducts.toFixed(2)),
//                     salesFromNonFoodProducts: parseFloat(month.salesFromNonFoodProducts.toFixed(2))
//                 };
//             });

//         // Calculate final accumulations
//         accumulations.orders.ordersFromAllProducts =
//             accumulations.orders.ordersFromFoodProducts + accumulations.orders.ordersFromNonFoodProducts;
//         accumulations.sales.salesFromAllProducts = parseFloat(
//             (accumulations.sales.salesFromFoodProducts + accumulations.sales.salesFromNonFoodProducts).toFixed(2)
//         );
//         accumulations.sales.totalSales = parseFloat(accumulations.sales.totalSales.toFixed(2));
//         accumulations.sales.salesFromFoodProducts = parseFloat(accumulations.sales.salesFromFoodProducts.toFixed(2));
//         accumulations.sales.salesFromNonFoodProducts = parseFloat(accumulations.sales.salesFromNonFoodProducts.toFixed(2));

//         return res.status(200).json({
//             success: true,
//             accumulations,
//             aggregations
//         });

//     } catch (err) {
//         console.log(`err.message controller`, err.message);
//         return res.status(500).json({
//             success: false,
//             code: 500,
//             error: i18n.__("internalServerError")
//         });
//     }
// };

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


