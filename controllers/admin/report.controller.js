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
const UAE_MAIN_CITIES = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];


exports.countCustomers = async (req, res) => {
    try {
        const { query: filterObject, body: { filters: queryObject } } = req;
        const pageNumber = req.query.page || 1;
        const limitNumber = req.query.limit || 0;

        const allDocuments = await customerRepo.list(
            filterObject,
            { isActive: 1, isDeleted: 1, hasPurchased: 1, address: 1 },
            {},
            pageNumber,
            limitNumber
        );

        const countingResults = {};
        const filterCategories = ['hasPurchased', 'isActive', "isDeleted"];
        const categoryMap = {
            hasPurchased: 'purchasing',
            isActive: 'active',
            isDeleted: 'deleted'
        };

        if (queryObject.cities) {
            for (const city of UAE_MAIN_CITIES) {
                const cityDocuments = allDocuments.result.filter((doc) => {
                    customerCity = doc.address?.city?.name || doc.address?.city?.CityName
                    return customerCity && customerCity?.toLowerCase() === city.toLowerCase()
                });
                const cityStats = {};
                for (const category of filterCategories) {
                    const filters = generateFilters(category, categoryMap);
                    const result = countObjectsByArrayOfFilters(cityDocuments, filters);
                    cityStats[category] = result.result;
                }
                countingResults[city] = cityStats;
                countingResults[city].total = cityDocuments.length;
            }

        } else {
            for (const category of filterCategories) {
                if (queryObject[category]) {
                    const filters = generateFilters(category, categoryMap);
                    const result = countObjectsByArrayOfFilters(allDocuments.result, filters);
                    countingResults[category] = result.result;
                }
            }

        }
        return res.status(200).json({
            success: true,
            code: 200,
            result: countingResults
        });

    } catch (err) {
        console.error(`Error in countSellers: ${err.message}`);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
};


exports.countSellers = async (req, res) => {
    try {
        const { query: filterObject, body: { filters: queryObject } } = req;
        const pageNumber = req.query.page || 1;
        const limitNumber = req.query.limit || 0;

        const allDocuments = await sellerRepo.list(
            filterObject,
            { isSubscribed: 1, isActive: 1, isVerified: 1, hasSold: 1, address: 1 },
            {},
            pageNumber,
            limitNumber
        );

        const countingResults = {};
        const filterCategories = ['isSubscribed', 'isVerified', 'hasSold', 'isActive'];
        const categoryMap = {
            isSubscribed: 'subscribed',
            isVerified: 'verified',
            hasSold: 'selling',
            isActive: 'active'
        };

        if (queryObject.cities) {
            for (const city of UAE_MAIN_CITIES) {
                const cityDocuments = allDocuments.result.filter((doc) => {
                    customerCity = doc.address?.city?.name || doc.address?.city?.CityName
                    return customerCity && customerCity?.toLowerCase() === city.toLowerCase()
                });
                const cityStats = {};
                for (const category of filterCategories) {
                    const filters = generateFilters(category, categoryMap);
                    const result = countObjectsByArrayOfFilters(cityDocuments, filters);
                    cityStats[category] = result.result;
                }
                countingResults[city] = cityStats;
                countingResults[city].total = cityDocuments.length;
            }

        } else {
            for (const category of filterCategories) {
                if (queryObject[category]) {
                    const filters = generateFilters(category, categoryMap);
                    const result = countObjectsByArrayOfFilters(allDocuments.result, filters);
                    countingResults[category] = result.result;
                }
            }

        }
        return res.status(200).json({
            success: true,
            code: 200,
            result: countingResults
        });

    } catch (err) {
        console.error(`Error in countSellers: ${err.message}`);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
};


// exports.countSellersBasedOnTiers = async (req, res) => {
//     try {
//         const { query: filterObject, body: { filters: queryObject } } = req;
//         const pageNumber = req.query.page || 1;
//         const limitNumber = req.query.limit || 0;

//         const allDocuments = await sellerRepo.list(
//             { ...filterObject, isSubscribed: true },
//             { joinDate: 1, type: 1, tier: 1, tierDuration: 1 },
//             {},
//             pageNumber,
//             limitNumber
//         );

//         const countingFilters = [
//             { label: "basic", conditions: [{ fieldName: "tier", fieldValue: "basic" }] },
//             { label: "basicYearly", conditions: [{ fieldName: "tier", fieldValue: "basic" }, { fieldName: "tierDuration", fieldValue: "year" }] },
//             { label: "basicMonthly", conditions: [{ fieldName: "tier", fieldValue: "basic" }, { fieldName: "tierDuration", fieldValue: "month" }] },
//             { label: "pro", conditions: [{ fieldName: "tier", fieldValue: "pro" }] },
//             { label: "proYearly", conditions: [{ fieldName: "tier", fieldValue: "pro" }, { fieldName: "tierDuration", fieldValue: "year" }] },
//             { label: "proMonthly", conditions: [{ fieldName: "tier", fieldValue: "pro" }, { fieldName: "tierDuration", fieldValue: "month" }] },
//             { label: "advanced", conditions: [{ fieldName: "tier", fieldValue: "advanced" }] },
//             { label: "advancedYearly", conditions: [{ fieldName: "tier", fieldValue: "advanced" }, { fieldName: "tierDuration", fieldValue: "year" }] },
//             { label: "advancedMonthly", conditions: [{ fieldName: "tier", fieldValue: "advanced" }, { fieldName: "tierDuration", fieldValue: "month" }] },
//             { label: "lifetime", conditions: [{ fieldName: "tier", fieldValue: "lifetime" }] }
//         ];

//         let countingResult = countObjectsByArrayOfFilters(allDocuments.result, countingFilters);
//         countingResult.result.accumulations = {}
//         countingResult.result.accumulations.basic = structureTierResult(countingResult, "basic");
//         countingResult.result.accumulations.pro = structureTierResult(countingResult, "pro");
//         countingResult.result.accumulations.advanced = structureTierResult(countingResult, "advanced");
//         countingResult.result.accumulations.lifetime = { total: countingResult.result.lifetime };

//         ["basic", "pro", "advanced", "lifetime", "basicYearly", "basicMonthly", "proYearly", "proMonthly", "advancedYearly", "advancedMonthly"].forEach(key => { delete countingResult.result[key] });

//         return res.status(200).json({
//             success: true,
//             code: 200,
//             result: countingResult.result
//         });

//     } catch (err) {
//         console.error(`Error in countSellers: ${err.message}`);
//         return res.status(500).json({
//             success: false,
//             code: 500,
//             error: i18n.__("internalServerError")
//         });
//     }
// };


exports.countSellersBasedOnTiers = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0;
        let startDate, endDate;

        if (filterObject.dateFrom && filterObject.dateTo) {
            startDate = moment(filterObject.dateFrom).startOf('day');
            endDate = moment(filterObject.dateTo).endOf('day');
        }

        const allDocuments = await sellerRepo.list(
            { ...filterObject, isSubscribed: true },
            { joinDate: 1, tier: 1, tierDuration: 1 },
            {},
            pageNumber,
            limitNumber
        );

        const countingFilters = [
            { label: "basicMonthly", conditions: [{ fieldName: "tier", fieldValue: "basic" }, { fieldName: "tierDuration", fieldValue: "month" }] },
            { label: "basicYearly", conditions: [{ fieldName: "tier", fieldValue: "basic" }, { fieldName: "tierDuration", fieldValue: "year" }] },
            { label: "proMonthly", conditions: [{ fieldName: "tier", fieldValue: "pro" }, { fieldName: "tierDuration", fieldValue: "month" }] },
            { label: "proYearly", conditions: [{ fieldName: "tier", fieldValue: "pro" }, { fieldName: "tierDuration", fieldValue: "year" }] },
            { label: "advancedMonthly", conditions: [{ fieldName: "tier", fieldValue: "advanced" }, { fieldName: "tierDuration", fieldValue: "month" }] },
            { label: "advancedYearly", conditions: [{ fieldName: "tier", fieldValue: "advanced" }, { fieldName: "tierDuration", fieldValue: "year" }] },
            { label: "lifetime", conditions: [{ fieldName: "tier", fieldValue: "lifetime" }] }
        ];

        let countingResult = countObjectsByArrayOfFilters(allDocuments.result, countingFilters);
        countingResult.result.accumulations = {}
        countingResult.result.accumulations.basic = structureTierResult(countingResult, "basic");
        countingResult.result.accumulations.pro = structureTierResult(countingResult, "pro");
        countingResult.result.accumulations.advanced = structureTierResult(countingResult, "advanced");
        countingResult.result.accumulations.lifetime = { total: countingResult.result.lifetime };

        ["basic", "pro", "advanced", "lifetime", "basicYearly", "basicMonthly", "proYearly", "proMonthly", "advancedYearly", "advancedMonthly"].forEach(key => { delete countingResult.result[key] });


        // Filter sellers by joinDate
        const sellersInRange = allDocuments.result.filter(seller =>
            moment(seller.joinDate).isBetween(startDate, endDate, null, '[]')
        );

        // Calculate time difference to determine the aggregation period
        const daysDiff = endDate.diff(startDate, 'days');
        const { aggregationPeriod, periodCount } = getAggregationPeriodAndCount(daysDiff);

        // Aggregating sellers based on the date range and tiers
        const aggregations = {};
        countingResult.result.aggregations = {}
        let currentPeriodStart = moment(startDate);

        for (let i = 0; i < periodCount; i++) {
            let periodEnd = getPeriodEnd(currentPeriodStart, aggregationPeriod);
            if (periodEnd.isAfter(endDate)) {
                periodEnd = moment(endDate);
            }

            const sellersInPeriod = sellersInRange.filter(seller =>
                moment(seller.joinDate).isBetween(currentPeriodStart, periodEnd, null, '[]')
            );

            const periodCounts = countObjectsByArrayOfFilters(sellersInPeriod, countingFilters);

            aggregations[currentPeriodStart.format('YYYY-MM-DD')] = {
                basic: structureTierResult(periodCounts, "basic") || 0,
                pro: structureTierResult(periodCounts, "pro") || 0,
                advanced: structureTierResult(periodCounts, "advanced") || 0,
                lifetime: { total: periodCounts.result.lifetime || 0 }
            };

            currentPeriodStart.add(1, aggregationPeriod);
        }

        countingResult.result.aggregations = aggregations
        countingResult.result.dateRange = {
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
            aggregationPeriod
        }

        // Return the result with aggregations
        return res.status(200).json({
            success: true,
            code: 200,
            result: countingResult.result

        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
            code: 500
        });
    }
};


function getAggregationPeriodAndCount(daysDiff) {
    let aggregationPeriod, periodCount;
    if (daysDiff <= 7) {
        aggregationPeriod = 'day';
        periodCount = 7;
    } else if (daysDiff <= 30) {
        aggregationPeriod = 'week';
        periodCount = 4;
    } else if (daysDiff <= 365) {
        aggregationPeriod = 'month';
        periodCount = Math.ceil(daysDiff / 30) + 1;
    } else {
        aggregationPeriod = 'year';
        periodCount = Math.ceil(daysDiff / 365) + 1;
    }
    return { aggregationPeriod, periodCount };
}


function getPeriodEnd(currentPeriodStart, aggregationPeriod) {
    switch (aggregationPeriod) {
        case 'day':
            return moment(currentPeriodStart).add(1, 'days');
        case 'week':
            return moment(currentPeriodStart).add(7, 'days');
        case 'month':
            return moment(currentPeriodStart).add(1, 'months');
        case 'year':
            return moment(currentPeriodStart).add(1, 'years');
        default:
            return moment(currentPeriodStart).endOf(aggregationPeriod);
    }
}


function generateFilters(category, categoryMap) {
    let baseLabel = categoryMap[category];
    let oppositeLabel = `not${baseLabel.charAt(0).toUpperCase() + baseLabel.slice(1)}`;

    const baseCondition = { fieldName: category, fieldValue: true };
    const oppositeCondition = { fieldName: category, fieldValue: false };
    const otherCategories = Object.keys(categoryMap).filter(c => c !== category);

    const filters = [
        { label: baseLabel, conditions: [baseCondition] },
        { label: oppositeLabel, conditions: [oppositeCondition] }
    ];

    for (const otherCategory of otherCategories) {
        let otherLabel = categoryMap[otherCategory];
        let notOtherLabel = `Not${otherLabel.charAt(0).toUpperCase() + otherLabel.slice(1)}`;

        filters.push(
            { label: `${baseLabel}And${otherLabel.charAt(0).toUpperCase() + otherLabel.slice(1)}`, conditions: [baseCondition, { fieldName: otherCategory, fieldValue: true }] },
            { label: `${baseLabel}And${notOtherLabel}`, conditions: [baseCondition, { fieldName: otherCategory, fieldValue: false }] },
            { label: `${oppositeLabel}And${otherLabel.charAt(0).toUpperCase() + otherLabel.slice(1)}`, conditions: [oppositeCondition, { fieldName: otherCategory, fieldValue: true }] },
            { label: `${oppositeLabel}And${notOtherLabel}`, conditions: [oppositeCondition, { fieldName: otherCategory, fieldValue: false }] }
        );
    }

    return filters;
}


const structureTierResult = (countingResult, tier) => ({
    year: countingResult.result[`${tier}Yearly`],
    month: countingResult.result[`${tier}Monthly`],
    total: countingResult.result[tier]
});