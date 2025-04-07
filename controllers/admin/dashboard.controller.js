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
const { countObjectsByArrayOfFilters } = require("../../helpers/report.helper");


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
        filterObject.isDeleted = false;
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
        const allDocuments = await shopRepo.list(filterObject, { isVerified: 1, isFood: 1, type: 1, isActive: 1 }, {}, pageNumber, limitNumber);
        const countingFilters = [
            { label: "verified", conditions: [{ fieldName: "isVerified", fieldValue: true }] },
            { label: "unverified", conditions: [{ fieldName: "isVerified", fieldValue: false }] },
            { label: "active", conditions: [{ fieldName: "isActive", fieldValue: true }] },
            { label: "inactive", conditions: [{ fieldName: "isActive", fieldValue: false }] },
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
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0;
        let orderTotal = 0;
        let subscriptionFees = 0;

        // Initialize tier revenue tracking
        const tierRevenue = {
            basic: {
                monthly: 0,
                yearly: 0,
                total: 0,
                numberOfSubscriptions: 0
            },
            pro: {
                monthly: 0,
                yearly: 0,
                total: 0,
                numberOfSubscriptions: 0
            },
            advanced: {
                monthly: 0,
                yearly: 0,
                total: 0,
                numberOfSubscriptions: 0
            },
            lifetime: {
                total: 0,
                numberOfSubscriptions: 0
            }
        };

        const orderSelectionObject = {
            orderType: 1,
            paymentMethod: 1,
        };

        // Process regular orders
        let allOrderDocuments = await orderRepo.aggregate(filterObject, orderSelectionObject);
        if (allOrderDocuments.success) {
            allOrderDocuments.result = allOrderDocuments?.result?.flatMap(order =>
                order?.subOrders?.map(subOrder => ({
                    paymentMethod: order.paymentMethod,
                    ...subOrder
                }))
            );
            allOrderDocuments.result = allOrderDocuments?.result?.filter((order) =>
                order.status === "delivered"
            );
            orderTotal = allOrderDocuments.result.reduce((total, order) =>
                parseFloat(total) + parseFloat(order.shopTotal), 0);
        }

        const commissionPercentage = 0.15;
        const commissions = parseInt(orderTotal * commissionPercentage) || 0;

        if (filterObject.dateField) filterObject.dateField = "timestamp";

        // Process subscription payments with detailed tier breakdown
        const allSubscriptionPayments = await paymentRepo.list(
            { ...filterObject, orderType: "subscription" },
            { subscriptionFees: 1, tier: 1, tierDuration: 1, freeTrialApplied: 1 },
            {},
            pageNumber,
            limitNumber
        );

        if (allSubscriptionPayments.success) {
            allSubscriptionPayments.result.forEach(payment => {
                // Add to total subscription fees
                subscriptionFees += parseFloat(payment.subscriptionFees);

                // Skip free trial subscriptions in revenue calculation if needed
                if (payment.freeTrialApplied) return;

                // Add to tier-specific revenue
                if (payment.tier !== 'lifetime') {
                    tierRevenue[payment.tier][payment.tierDuration === 'month' ? 'monthly' : 'yearly']
                        += parseFloat(payment.subscriptionFees);
                    tierRevenue[payment.tier].total += parseFloat(payment.subscriptionFees);
                    tierRevenue[payment.tier].numberOfSubscriptions++;
                } else {
                    tierRevenue.lifetime.total += parseFloat(payment.subscriptionFees);
                    tierRevenue.lifetime.numberOfSubscriptions++;
                }
            });
        }

        // Calculate summary metrics
        const totalMonthlyRevenue = Object.values(tierRevenue)
            .reduce((sum, tier) => sum + (tier.monthly || 0), 0);
        const totalYearlyRevenue = Object.values(tierRevenue)
            .reduce((sum, tier) => sum + (tier.yearly || 0), 0);
        const totalLifetimeRevenue = tierRevenue.lifetime.total;

        return res.status(200).json({
            totalRevenues: parseInt(commissions + subscriptionFees),
            orders: {
                totalSales: parseInt(orderTotal),
                totalRevenueFromOrders: commissions,
                commissionPercentage,
            },
            subscriptions: {
                totalRevenueFromSubscriptionFees: parseInt(subscriptionFees),
                byTier: tierRevenue,
                summary: {
                    monthlyTotal: parseInt(totalMonthlyRevenue),
                    yearlyTotal: parseInt(totalYearlyRevenue),
                    lifetimeTotal: parseInt(totalLifetimeRevenue)
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
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0;
        const sumByRange = true;
        delete req.query.sumByRange;

        let startDate, endDate;
        if (filterObject.dateFrom && filterObject.dateTo) {
            startDate = moment(filterObject.dateFrom).utc().startOf('day');
            endDate = moment(filterObject.dateTo).utc().endOf('day');
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
            // const sortedOrders = [...allOrderDocuments.result, ...allServiceRequests.result];
            console.log("allOrderDocuments.result[allOrderDocuments.result.length - 1].issueDate", allOrderDocuments.result[allOrderDocuments.result.length - 1].issueDate)
            startDate = moment(allOrderDocuments.result[allOrderDocuments.result.length - 1].issueDate).utc().startOf('day');
            endDate = moment(allOrderDocuments.result[0].issueDate).utc().endOf('day');
            console.log("startDate", startDate)
            console.log("endDate", endDate)
        }

        const daysDiff = endDate.diff(startDate, 'days');
        const { aggregationPeriod, periodCount } = getAggregationPeriodAndCount(daysDiff, sumByRange);

        const aggregations = {};
        let currentPeriodStart = moment(startDate).utc();

        for (let i = 0; i < periodCount; i++) {
            let periodEnd = getPeriodEnd(currentPeriodStart, aggregationPeriod);
            if (periodEnd.isAfter(endDate)) {
                periodEnd = moment(endDate).utc();
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


exports.getOrdersStatsByDay = async (req, res) => {
    try {
        const filterObject = req.query;
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

        allOrderDocuments.result = allOrderDocuments.result.filter((order) => order.status === orderStatus);

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
        ).filter((order) => order.status === orderStatus);

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
        const filterObject = req.query;
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
}


exports.getServiceRequestStatsByMonth = async (req, res) => {
    try {
        const filterObject = req.query;
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


async function getFilteredOrders(filterObject, orderSelectionObject) {
    let allOrderDocuments = await orderRepo.aggregate(filterObject, orderSelectionObject);
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


function getPeriodEnd(currentPeriodStart, aggregationPeriod) {
    switch (aggregationPeriod) {
        case 'day':
            return moment(currentPeriodStart).utc().add(1, 'days');
        case 'week':
            return moment(currentPeriodStart).utc().add(7, 'days');
        case 'month':
            return moment(currentPeriodStart).utc().add(30, 'days');
        case 'year':
            return moment(currentPeriodStart).utc().add(365, 'days');
        default:
            return moment(currentPeriodStart).utc().endOf(aggregationPeriod);
    }
}


function filterAndCountOrders(orders, serviceRequests, currentPeriodStart, periodEnd, orderCountingFilters) {
    const periodOrders = orders.filter(order =>
        moment(order.issueDate).utc().isBetween(currentPeriodStart, periodEnd, null, '[]')
    );
    const periodServiceRequests = serviceRequests.filter(request =>
        moment(request.issueDate).utc().isBetween(currentPeriodStart, periodEnd, null, '[]')
    );

    const periodCounts = countObjectsByArrayOfFilters(periodOrders, orderCountingFilters);

    return { periodOrders, periodServiceRequests, periodCounts };
}


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


const getMonthKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};