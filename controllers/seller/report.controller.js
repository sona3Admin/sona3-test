const i18n = require('i18n');
const orderRepo = require("../../modules/Order/order.repo");
const requestRepo = require("../../modules/Request/request.repo");
const productRepo = require('../../modules/Product/product.repo');
const serviceRepo = require('../../modules/Service/service.repo');
const sellerRepo = require('../../modules/Seller/seller.repo');
const { groupByCategories } = require('../admin/report.controller');
const moment = require('moment');
const { getTiers } = require("../../helpers/tiers.helper")


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




exports.getOrdersStatsByDay = async (req, res) => {
    try {
        let filterObject = req.query;
        const orderStatus = req.query.status || "delivered";
        delete req.query.status;
        const orderSelectionObject = {
            orderType: 1, paymentMethod: 1, cartTotal: 1, cartOriginalTotal: 1,
            shippingFeesTotal: 1, taxesTotal: 1, orderTotal: 1, issueDate: 1, _id: 1
        };

        let allOrderDocuments = await orderRepo.aggregate(filterObject, orderSelectionObject);
        if (!allOrderDocuments.success) allOrderDocuments = { success: true, code: 200, result: [] };



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
                _id: order._id?.toString(),
                ...subOrder
            }))
        );
        allOrderDocuments.result = allOrderDocuments.result.filter((order) => order.status === orderStatus && order.seller.toString() === req.tokenData._id.toString());


        const accumulations = {
            orders: {
                totalOrderCount: 0,
                totalDaysOfOrders: 0,
                ordersFromFoodProducts: 0,
                ordersFromNonFoodProducts: 0,
                ordersFromAllProducts: 0
            },
            sales: {
                totalSales: 0,
                salesFromFoodProducts: 0,
                salesFromNonFoodProducts: 0,
                salesFromAllProducts: 0
            },
            shippingFees: {
                shippingFeesFromFoodProducts: 0,
                shippingFeesFromNonFoodProducts: 0,
                shippingFeesTotal: 0
            },
            highestOrderFromFood: {
                orderTotal: 0,
                orderId: null,
            },
            highestOrderFromNonFood: {
                orderTotal: 0,
                orderId: null,
            }
        };

        const issueDateCounts = allOrderDocuments.result.reduce((acc, order) => {
            const date = new Date(order.issueDate);

            const dateString = date.toISOString().split('T')[0];
            if (!acc[dateString]) {
                acc[dateString] = {
                    orderCount: 0,
                    totalSales: 0,
                    ordersFromFoodProducts: 0,
                    ordersFromNonFoodProducts: 0,
                    salesFromFoodProducts: 0,
                    salesFromNonFoodProducts: 0,
                    shippingFeesTotal: 0,
                    shippingFeesFromFoodProducts: 0,
                    shippingFeesFromNonFoodProducts: 0,
                    sellersOfTheDay: []
                };
            }

            acc[dateString].orderCount++;
            acc[dateString].totalSales += order.cartTotal;
            acc[dateString].shippingFeesTotal += order.shippingFeesTotal;

            if (order.orderType === "basket") {
                acc[dateString].ordersFromFoodProducts++;
                acc[dateString].salesFromFoodProducts += order.cartTotal;
                acc[dateString].shippingFeesFromFoodProducts += order.shippingFeesTotal;
                if (order.cartTotal > accumulations.highestOrderFromFood.orderTotal) {
                    accumulations.highestOrderFromFood.orderTotal = order.cartTotal;
                    accumulations.highestOrderFromFood.orderId = order._id;
                }
            } else if (order.orderType === "cart") {

                acc[dateString].ordersFromNonFoodProducts++;
                acc[dateString].salesFromNonFoodProducts += order.cartTotal;
                acc[dateString].shippingFeesFromNonFoodProducts += order.shippingFeesTotal;
                if (order.cartTotal > accumulations.highestOrderFromNonFood.orderTotal) {
                    accumulations.highestOrderFromNonFood.orderTotal = order.cartTotal;
                    accumulations.highestOrderFromNonFood.orderId = order._id;
                }
            }

            // Sellers of the day logic
            let sellerShopEntry = acc[dateString].sellersOfTheDay.find(
                entry => entry.seller === order.seller.toString() && entry.shop === order.shop.toString()
            );

            if (sellerShopEntry) {
                sellerShopEntry.orderCount += 1;
                // sellerShopEntry.orders.push(order._id.toString());
            } else {
                acc[dateString].sellersOfTheDay.push({
                    seller: order.seller.toString(),
                    shop: order.shop.toString(),
                    orderType: order.orderType,
                    orderCount: 1,
                    // orders: [order._id.toString()]
                });
            }

            // Accumulate overall statistics
            accumulations.orders.totalOrderCount++;
            accumulations.sales.totalSales += parseFloat(order.cartTotal.toFixed(2));
            accumulations.shippingFees.shippingFeesTotal += parseFloat(order.shippingFeesTotal.toFixed(2));

            if (order.orderType === "basket") {
                accumulations.orders.ordersFromFoodProducts++;
                accumulations.sales.salesFromFoodProducts += parseFloat(order.cartTotal.toFixed(2));
                accumulations.shippingFees.shippingFeesFromFoodProducts += parseFloat(order.shippingFeesTotal.toFixed(2));
            } else if (order.orderType === "cart") {
                accumulations.orders.ordersFromNonFoodProducts++;
                accumulations.sales.salesFromNonFoodProducts += parseFloat(order.cartTotal.toFixed(2));
                accumulations.shippingFees.shippingFeesFromNonFoodProducts += parseFloat(order.shippingFeesTotal.toFixed(2));
            }

            return acc;
        }, {});

        accumulations.orders.totalDaysOfOrders = Object.keys(issueDateCounts).length;
        accumulations.orders.ordersFromAllProducts = accumulations.orders.ordersFromFoodProducts + accumulations.orders.ordersFromNonFoodProducts;
        accumulations.sales.salesFromAllProducts = parseFloat(accumulations.sales.salesFromFoodProducts.toFixed(2)) +
            parseFloat(accumulations.sales.salesFromNonFoodProducts.toFixed(2));

        accumulations.shippingFees.shippingFeesTotal = parseFloat(accumulations.shippingFees.shippingFeesFromFoodProducts.toFixed(2)) + parseFloat(accumulations.shippingFees.shippingFeesFromNonFoodProducts.toFixed(2));
        const issueDatesWithCounts = Object.keys(issueDateCounts).map(date => ({
            issueDate: date,
            orderCount: issueDateCounts[date].orderCount,
            totalSales: parseFloat(issueDateCounts[date].totalSales.toFixed(2)),
            ordersFromFoodProducts: issueDateCounts[date].ordersFromFoodProducts,
            ordersFromNonFoodProducts: issueDateCounts[date].ordersFromNonFoodProducts,
            salesFromFoodProducts: parseFloat(issueDateCounts[date].salesFromFoodProducts.toFixed(2)),
            salesFromNonFoodProducts: parseFloat(issueDateCounts[date].salesFromNonFoodProducts.toFixed(2)),
            shippingFeesTotal: parseFloat(issueDateCounts[date].shippingFeesTotal.toFixed(2)),
            shippingFeesFromFoodProducts: parseFloat(issueDateCounts[date].shippingFeesFromFoodProducts.toFixed(2)),
            shippingFeesFromNonFoodProducts: parseFloat(issueDateCounts[date].shippingFeesFromNonFoodProducts.toFixed(2)),
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
}



exports.getOrdersStatsByMonth = async (req, res) => {
    try {
        const filterObject = req.query;
        const orderStatus = req.query.status || "delivered";
        delete req.query.status;
        const orderSelectionObject = {
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

        let allOrderDocuments = await orderRepo.aggregate(filterObject, orderSelectionObject);

        if (!allOrderDocuments.result) return res.status(200).json({ success: true, result: [] });

        // Flatten and filter orders
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
                _id: order._id?.toString(),
                ...subOrder
            }))
        ).filter((order) => order.status === orderStatus && order.seller.toString() === req.tokenData._id.toString());

        // Initialize aggregation object
        const monthlyAggregations = {};
        const accumulations = {
            orders: {
                totalOrderCount: 0,
                totalMonthsOfOrders: 0,
                ordersFromFoodProducts: 0,
                ordersFromNonFoodProducts: 0,
                ordersFromAllProducts: 0
            },
            sales: {
                totalSales: 0,
                salesFromFoodProducts: 0,
                salesFromNonFoodProducts: 0,
                salesFromAllProducts: 0
            },
            shippingFees: {
                shippingFeesFromFoodProducts: 0,
                shippingFeesFromNonFoodProducts: 0,
                shippingFeesTotal: 0
            },
            highestOrderFromFood: {
                orderTotal: 0,
                orderId: null,
            },
            highestOrderFromNonFood: {
                orderTotal: 0,
                orderId: null,
            }
        };
        let minDate = null;
        let maxDate = null;

        // Group orders by month
        allOrderDocuments.result.forEach(order => {
            const orderDate = new Date(order.issueDate);
            const monthKey = getMonthKey(orderDate);

            if (!minDate || orderDate < minDate) minDate = new Date(orderDate);
            if (!maxDate || orderDate > maxDate) maxDate = new Date(orderDate);

            if (!monthlyAggregations[monthKey]) {
                monthlyAggregations[monthKey] = {
                    issueDate: monthKey,
                    orderCount: 0,
                    ordersFromFoodProducts: 0,
                    ordersFromNonFoodProducts: 0,
                    totalSales: 0,
                    salesFromFoodProducts: 0,
                    salesFromNonFoodProducts: 0,
                    shippingFeesTotal: 0,
                    shippingFeesFromFoodProducts: 0,
                    shippingFeesFromNonFoodProducts: 0,
                    sellersOfTheMonth: []
                };
            }

            const month = monthlyAggregations[monthKey];
            month.orderCount++;
            month.totalSales += order.cartTotal;
            month.shippingFeesTotal += order.shippingFeesTotal;

            if (order.orderType === "basket") {
                month.ordersFromFoodProducts++;
                month.salesFromFoodProducts += order.cartTotal;
                month.shippingFeesFromFoodProducts += order.shippingFeesTotal;
            } else if (order.orderType === "cart") {
                month.ordersFromNonFoodProducts++;
                month.salesFromNonFoodProducts += order.cartTotal;
                month.shippingFeesFromNonFoodProducts += order.shippingFeesTotal;
            }

            if (order.orderType === "basket" && order.cartTotal > accumulations.highestOrderFromFood.orderTotal) {
                accumulations.highestOrderFromFood.orderTotal = order.cartTotal;
                accumulations.highestOrderFromFood.orderId = order._id;
            } else if (order.orderType === "cart" && order.cartTotal > accumulations.highestOrderFromNonFood.orderTotal) {
                accumulations.highestOrderFromNonFood.orderTotal = order.cartTotal;
                accumulations.highestOrderFromNonFood.orderId = order._id;
            }
            // Update sellers
            let sellerEntry = month.sellersOfTheMonth.find(
                entry => entry.seller === order.seller.toString() && entry.shop === order.shop.toString()
            );

            if (sellerEntry) {
                sellerEntry.orderCount++;
                sellerEntry.totalSales += order.cartTotal;
            } else {
                month.sellersOfTheMonth.push({
                    seller: order.seller.toString(),
                    shop: order.shop.toString(),
                    orderType: order.orderType,
                    orderCount: 1,
                    totalSales: order.cartTotal
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
                        ordersFromFoodProducts: 0,
                        ordersFromNonFoodProducts: 0,
                        salesFromFoodProducts: 0,
                        salesFromNonFoodProducts: 0,
                        shippingFeesTotal: 0,
                        shippingFeesFromFoodProducts: 0,
                        shippingFeesFromNonFoodProducts: 0,
                        sellersOfTheMonth: []
                    };
                }

                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }

        // Calculate accumulations
        accumulations.orders.totalMonthsOfOrders = Object.keys(monthlyAggregations).length;

        // Convert monthlyAggregations to array and calculate accumulations
        const aggregations = Object.values(monthlyAggregations)
            .sort((a, b) => a.issueDate.localeCompare(b.issueDate))
            .map(month => {
                // Update accumulations
                accumulations.orders.totalOrderCount += month.orderCount;
                accumulations.orders.ordersFromFoodProducts += month.ordersFromFoodProducts;
                accumulations.orders.ordersFromNonFoodProducts += month.ordersFromNonFoodProducts;
                accumulations.sales.totalSales += month.totalSales;
                accumulations.sales.salesFromFoodProducts += month.salesFromFoodProducts;
                accumulations.sales.salesFromNonFoodProducts += month.salesFromNonFoodProducts;
                accumulations.shippingFees.shippingFeesFromFoodProducts += month.shippingFeesFromFoodProducts;
                accumulations.shippingFees.shippingFeesFromNonFoodProducts += month.shippingFeesFromNonFoodProducts;
                accumulations.shippingFees.shippingFeesTotal += month.shippingFeesFromFoodProducts + month.shippingFeesFromNonFoodProducts;

                // Format numbers for the month
                return {
                    ...month,
                    totalSales: parseFloat(month.totalSales.toFixed(2)),
                    salesFromFoodProducts: parseFloat(month.salesFromFoodProducts.toFixed(2)),
                    salesFromNonFoodProducts: parseFloat(month.salesFromNonFoodProducts.toFixed(2))
                };
            });

        // Calculate final accumulations
        accumulations.orders.ordersFromAllProducts =
            accumulations.orders.ordersFromFoodProducts + accumulations.orders.ordersFromNonFoodProducts;
        accumulations.sales.salesFromAllProducts = parseFloat(
            (accumulations.sales.salesFromFoodProducts + accumulations.sales.salesFromNonFoodProducts).toFixed(2)
        );
        accumulations.sales.totalSales = parseFloat(accumulations.sales.totalSales.toFixed(2));
        accumulations.sales.salesFromFoodProducts = parseFloat(accumulations.sales.salesFromFoodProducts.toFixed(2));
        accumulations.sales.salesFromNonFoodProducts = parseFloat(accumulations.sales.salesFromNonFoodProducts.toFixed(2));

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


exports.getServiceRequestsStatsByDay = async (req, res) => {
    try {
        const filterObject = { ...req.query, seller: req.tokenData._id };
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0;
        req.query.status = req.query.status || "purchased";
        const serviceRequestSelectionObject = { status: 1, serviceTotal: 1, taxesTotal: 1, orderTotal: 1, issueDate: 1, seller: 1, shop: 1 };
        let allServiceRequests = await requestRepo.list({ ...filterObject, status: "purchased" }, serviceRequestSelectionObject, { issueDate: -1 }, pageNumber, limitNumber);
        if (!allServiceRequests.success) allServiceRequests = { success: true, code: 200, result: [] };

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

            const dateString = date.toISOString().split('T')[0];

            if (!acc[dateString]) {
                acc[dateString] = {
                    orderCount: 0,
                    totalSales: 0,
                    sellersOfTheDay: []
                };
            }

            acc[dateString].orderCount++;
            acc[dateString].totalSales += order.serviceTotal;

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
            accumulations.sales.totalSales += parseFloat(order.serviceTotal.toFixed(2));

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
}


exports.getServiceRequestStatsByMonth = async (req, res) => {
    try {
        const filterObject = { ...req.query, seller: req.tokenData._id };
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0;
        req.query.status = req.query.status || "purchased";
        const serviceRequestSelectionObject = { status: 1, serviceTotal: 1, taxesTotal: 1, orderTotal: 1, issueDate: 1, seller: 1, shop: 1 };
        let allServiceRequests = await requestRepo.list({ ...filterObject, status: "purchased" }, serviceRequestSelectionObject, { issueDate: -1 }, pageNumber, limitNumber);
        if (!allServiceRequests.success) allServiceRequests = { success: true, code: 200, result: [] };
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
            month.totalSales += order.serviceTotal;


            // Update sellers
            let sellerEntry = month.sellersOfTheDay.find(
                entry => entry.seller === order.seller._id.toString() && entry.shop === order.shop._id.toString()
            );

            if (sellerEntry) {
                sellerEntry.orderCount++;
                sellerEntry.totalSales += order.serviceTotal;
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


exports.financesOrders = async (req, res) => {
    try {
        const filterObject = req.query;
        let orderTotal = 0;
        let subscriptionFees = 0;
        let orderStatus = req.query.status || "delivered";
        delete req.query.status;

        let startDate, endDate, dueDate;
        if (filterObject.dateFrom && filterObject.dateTo) {
            startDate = moment(filterObject.dateFrom).startOf('day');
            endDate = moment(filterObject.dateTo).endOf('day');
            dueDate = moment(filterObject.dateFrom).endOf('day');
        } else {
            startDate = moment().startOf('day');
            endDate = moment().endOf('day');
            dueDate = moment().startOf('day');
        }

        const startDayOfMonth = startDate.date();
        const endDayOfMonth = endDate.date();
        const startMonth = startDate.month();
        const endMonth = endDate.month();
        const startYear = startDate.year();
        const endYear = endDate.year();

        if (startMonth !== endMonth || startYear !== endYear) {
            return res.status(400).json({
                success: false,
                code: 400,
                error: i18n.__("invalidDateRange")
            });
        }

        if (startDayOfMonth <= 15 && endDayOfMonth <= 15) {
            startDate = startDate.utc().date(1).startOf('day');
            endDate = moment(startDate).utc().date(15).endOf('day');
            dueDate = moment(startDate).utc().add(1, 'month').startOf('month').startOf('day');

        } else if (startDayOfMonth > 15 && endDayOfMonth > 15) {
            startDate = startDate.utc().date(16).startOf('day');
            endDate = moment(startDate).utc().endOf('month').endOf('day');
            dueDate = moment(startDate).utc().add(1, 'month').date(16).startOf('day');
        } else {
            return res.status(400).json({
                success: false,
                code: 400,
                error: i18n.__("invalidDateRange")
            });
        }


        filterObject.dateFrom = startDate.toISOString();
        filterObject.dateTo = endDate.toISOString();
        filterObject.dateField = "issueDate";

        const orderSelectionObject = {
            issueDate: 1, shopTotal: 1
        };


        let allOrderDocuments = await orderRepo.aggregate(filterObject, orderSelectionObject);


        if (allOrderDocuments.success) {
            allOrderDocuments.result = allOrderDocuments?.result?.flatMap(order =>
                order?.subOrders?.map(subOrder => ({
                    issueDate: order.issueDate,
                    ...subOrder
                }))
            );
            allOrderDocuments.result = allOrderDocuments?.result?.filter((order) =>
                order.status === orderStatus &&
                order.seller.toString() === req.tokenData._id.toString()
            );

            orderTotal = allOrderDocuments.result.reduce((total, order) =>
                parseFloat(total) + parseFloat(order.shopTotal), 0);
        } else allOrderDocuments = { success: true, code: 200, result: [] };

        const commissionPercentage = 0.15;
        const commissions = parseInt(orderTotal * commissionPercentage) || 0;
        const netSales = orderTotal - commissions;

        const sellerObject = await sellerRepo.get({ _id: req.tokenData._id }, {
            _id: 1, isSubscribed: 1, subscriptionStartDate: 1, subscriptionEndDate: 1, tier: 1, tierDuration: 1, type: 1
        });
        const subscriptionRenewalDate = moment(sellerObject.result.subscriptionEndDate);
        const remainingSubscriptionDays = subscriptionRenewalDate.diff(moment(), 'days');

        const tierDetails = await getTiers(`${sellerObject.result.tier}_${sellerObject.result.type}`)
        subscriptionFees = sellerObject.result.tierDuration == "month" ? parseFloat(tierDetails.monthlyFees) : parseFloat(tierDetails.yearlyFees)

        const issueDateCounts = allOrderDocuments.result.reduce((acc, order) => {

            const date = new Date(order.issueDate);

            const dateString = date.toISOString().split('T')[0];
            if (!acc[dateString]) {
                acc[dateString] = {
                    orderCount: 0,
                    orderTotal: 0,
                    commissionPercentage: commissionPercentage,
                    commissions: 0,
                    netSales: 0,
                };
            }

            acc[dateString].orderCount++;
            acc[dateString].orderTotal += order.shopTotal;

            acc[dateString].commissions += parseInt(order.shopTotal * commissionPercentage);
            acc[dateString].netSales += order.shopTotal - parseInt(order.shopTotal * commissionPercentage);

            return acc;
        }, {});
        const issueDatesWithCounts = Object.keys(issueDateCounts).map(date => ({
            issueDate: date,
            orderCount: issueDateCounts[date].orderCount,
            totalSales: parseFloat(issueDateCounts[date].orderTotal.toFixed(2)),
            commissions: parseFloat(issueDateCounts[date].commissions.toFixed(2)),
            commissionsPercentage: issueDateCounts[date].commissionPercentage,
            netSales: parseFloat(issueDateCounts[date].netSales.toFixed(2)),
        }));
        res.status(200).json({
            success: true,
            code: 200,
            orderDetails: {
                orderTotal: orderTotal,
                totalOrderCount: allOrderDocuments.result.length,
                commissions: commissions,
                commissionsPercentage: commissionPercentage,
                totalSales: netSales,
                dateDetails: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    dueDate: dueDate.toISOString(),
                }

            },
            aggregations: issueDatesWithCounts,
            subscriptionDetails: {
                remainingSubscriptionDays: remainingSubscriptionDays,
                subscriptionFees: subscriptionFees,
                subscriptionTier: sellerObject.result.tier,
                subscriptionTierDuration: sellerObject.result.tierDuration,
                subscriptionDateDetails: {
                    subscriptionStartDate: sellerObject.result.subscriptionStartDate,
                    subscriptionEndDate: sellerObject.result.subscriptionEndDate,
                    subscriptionRenewalDate: subscriptionRenewalDate.toISOString(),
                }
            },
        });

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
};

exports.financesServicesRequest = async (req, res) => {
    try {
        const filterObject = { ...req.query, seller: req.tokenData._id };
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0;
        let subscriptionFees = 0;
        let orderStatus = req.query.status || "purchased";
        delete req.query.status;

        let totalSales = 0;


        let startDate, endDate, dueDate;
        if (filterObject.dateFrom && filterObject.dateTo) {
            startDate = moment(filterObject.dateFrom).startOf('day');
            endDate = moment(filterObject.dateTo).endOf('day');
            dueDate = moment(filterObject.dateFrom).endOf('day');
        } else {
            startDate = moment().startOf('day');
            endDate = moment().endOf('day');
            dueDate = moment().startOf('day');
        }

        const startDayOfMonth = startDate.date();
        const endDayOfMonth = endDate.date();
        const startMonth = startDate.month();
        const endMonth = endDate.month();
        const startYear = startDate.year();
        const endYear = endDate.year();

        if (startMonth !== endMonth || startYear !== endYear) {
            return res.status(400).json({
                success: false,
                code: 400,
                error: i18n.__("invalidDateRange")
            });
        }

        if (startDayOfMonth <= 15 && endDayOfMonth <= 15) {
            startDate = startDate.utc().date(1).startOf('day');
            endDate = moment(startDate).utc().date(15).endOf('day');
            dueDate = moment(startDate).utc().add(1, 'month').startOf('month').startOf('day');

        } else if (startDayOfMonth > 15 && endDayOfMonth > 15) {
            startDate = startDate.utc().date(16).startOf('day');
            endDate = moment(startDate).utc().endOf('month').endOf('day');
            dueDate = moment(startDate).utc().add(1, 'month').date(16).startOf('day');
        } else {
            return res.status(400).json({
                success: false,
                code: 400,
                error: i18n.__("invalidDateRange")
            });
        }


        filterObject.dateFrom = startDate.toISOString();
        filterObject.dateTo = endDate.toISOString();
        filterObject.dateField = "issueDate";

        const serviceRequestSelectionObject = { status: 1, orderTotal: 1, issueDate: 1, seller: 1, shop: 1 , serviceTotal: 1};

        let allServiceRequests = await requestRepo.list({ ...filterObject, status: orderStatus }, serviceRequestSelectionObject, { issueDate: -1 }, pageNumber, limitNumber);        
        if (!allServiceRequests.success) allServiceRequests = { success: true, code: 200, result: [] };

        const sellerObject = await sellerRepo.get({ _id: req.tokenData._id }, {
            _id: 1, isSubscribed: 1, subscriptionStartDate: 1, subscriptionEndDate: 1, tier: 1, tierDuration: 1, type: 1
        });
        const subscriptionRenewalDate = moment(sellerObject.result.subscriptionEndDate);
        const remainingSubscriptionDays = subscriptionRenewalDate.diff(moment(), 'days');

        const tierDetails = await getTiers(`${sellerObject.result.tier}_${sellerObject.result.type}`)
        subscriptionFees = sellerObject.result.tierDuration == "month" ? parseFloat(tierDetails.monthlyFees) : parseFloat(tierDetails.yearlyFees)

        const issueDateCounts = allServiceRequests.result.reduce((acc, order) => {
            const date = new Date(order.issueDate);

            const dateString = date.toISOString().split('T')[0];

            if (!acc[dateString]) {
                acc[dateString] = {
                    orderCount: 0,
                    totalSales: 0,
                };
            }

            acc[dateString].orderCount++;
            acc[dateString].totalSales += order.serviceTotal;

            totalSales += parseFloat(order.serviceTotal.toFixed(2));
            return acc;
        }, {});
        const issueDatesWithCounts = Object.keys(issueDateCounts).map(date => ({
            issueDate: date,
            orderCount: issueDateCounts[date].orderCount,
            totalSales: parseFloat(issueDateCounts[date].totalSales.toFixed(2)),
        }));

        res.status(200).json({
            success: true,
            code: 200,
            orderDetails: {
                totalOrderCount: allServiceRequests.result.length,
                totalSales: totalSales,
                dateDetails: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    dueDate: dueDate.toISOString(),
                }

            },
            aggregations: issueDatesWithCounts,
            subscriptionDetails: {
                remainingSubscriptionDays: remainingSubscriptionDays,
                subscriptionFees: subscriptionFees,
                subscriptionTier: sellerObject.result.tier,
                subscriptionTierDuration: sellerObject.result.tierDuration,
                subscriptionDateDetails: {
                    subscriptionStartDate: sellerObject.result.subscriptionStartDate,
                    subscriptionEndDate: sellerObject.result.subscriptionEndDate,
                    subscriptionRenewalDate: subscriptionRenewalDate.toISOString(),
                }
            },
        });

    } catch (err) {
        console.log(`err.message`, err.message);
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

const getMonthKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};