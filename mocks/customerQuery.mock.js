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
const productRepo = require('../modules/Product/product.repo');
const { UAE_MAIN_CITIES } = require('../controllers/admin/report.controller');
const { countObjectsByArrayOfFilters } = require('../helpers/report.helper');

// exports.executeQuery = async (req, res) => {
//     try {
//         const filterObject = req.query;
//         const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 0
//         let allOrderDocuments = await orderRepo.list(filterObject, { sellers: 1 }, {}, pageNumber, limitNumber)
//         const mostSellingSeller = allOrderDocuments.result.reduce((acc, order) => {
//             order.sellers.forEach(seller => {
//                 if (!acc[seller]) {
//                     acc[seller] = 0
//                 }
//                 acc[seller] += 1
//             })
//             return acc
//         }, {})
//         const sellerIds = Object.keys(mostSellingSeller)
//         const sellers = await sellerModel.find({ _id: { $in: sellerIds } })
//         const sellerNames = sellers.map(seller => seller = { _id: seller._id, userName: seller.userName, email: seller.email, count: mostSellingSeller[seller._id] })
//         return res.status(200).json({
//             success: true,
//             code: 200,
//             result: sellerNames
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

exports.executeQuery = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1;
        const limitNumber = req.query.limit || 0;
        const productSelection = {
            isActive: 1, isVerified: 1, isFood: 1, creationDate: 1, orderCount: 1, discountValue: 1,
            nameEn: 1, nameAr: 1, rating: 1, defaultVariation: 1, stock: 1
        };

        const allDocuments = await productRepo.list(
            { ...filterObject, isDeleted: false },
            productSelection,
            {}, pageNumber, limitNumber
        );

        // let countingResults = {};
        // const filterCategories = ['isActive', 'isVerified'];
        // const categoryMap = { isActive: 'active', isVerified: 'verified' };

        // countingResults = groupByCategories(filterObject, filterCategories, categoryMap, allDocuments)

        return res.status(200).json({
            success: true,
            code: 200,
            result: allDocuments
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


function groupShopsByType(queryObject, filterCategories, categoryMap, allDocuments, countingResults) {
    const countingFilters = [
        { label: "productShops", conditions: [{ fieldName: "type", fieldValue: "product" }] },
        { label: "foodShops", conditions: [{ fieldName: "isFood", fieldValue: true }, { fieldName: "type", fieldValue: "product" }] },
        { label: "nonFoodShops", conditions: [{ fieldName: "isFood", fieldValue: false }, { fieldName: "type", fieldValue: "product" }] },
        { label: "serviceShops", conditions: [{ fieldName: "type", fieldValue: "service" }] },

    ];
    const typeCountingResult = countObjectsByArrayOfFilters(allDocuments.result, countingFilters)
    let allFoodShops = { result: [] }
    let allNonFoodShops = { result: [] }
    let allServiceShops = { result: [] }
    allFoodShops.result = allDocuments.result.filter(shop => shop.type == "product" && shop.isFood == true);
    allFoodShops = groupByCategories(queryObject, filterCategories, categoryMap, allFoodShops)

    allNonFoodShops.result = allDocuments.result.filter(shop => shop.type == "product" && shop.isFood == false);
    allNonFoodShops = groupByCategories(queryObject, filterCategories, categoryMap, allNonFoodShops)

    allServiceShops.result = allDocuments.result.filter(shop => shop.type == "service");
    allServiceShops = groupByCategories(queryObject, filterCategories, categoryMap, allServiceShops)

    countingResults.type = {}
    countingResults.type.productShops = {
        foodShops: { ...allFoodShops, total: typeCountingResult.result.foodShops },
        nonFoodShops: { ...allNonFoodShops, total: typeCountingResult.result.nonFoodShops },
        total: typeCountingResult.result.productShops
    };
    countingResults.type.serviceShops = { ...allServiceShops, total: typeCountingResult.result.serviceShops }
    countingResults.type.total = parseInt(countingResults.type.productShops.total) + parseInt(typeCountingResult.result.serviceShops)
    return countingResults
}


function groupShopsByDateRange(filterObject, queryObject, filterCategories, categoryMap, allDocuments, countingResults) {
    let startDate, endDate;

    if (filterObject.dateFrom && filterObject.dateTo) {
        startDate = moment(filterObject.dateFrom).startOf('day');
        endDate = moment(filterObject.dateTo).endOf('day');
    }

    let typeCountingResult = {}
    let accumulationResults = {}
    accumulationResults = groupShopsByType(queryObject, filterCategories, categoryMap, allDocuments, countingResults)
    typeCountingResult.accumulations = accumulationResults

    const shopsInRange = allDocuments.result.filter(seller =>
        moment(seller.joinDate).isBetween(startDate, endDate, null, '[]')
    );

    const daysDiff = endDate.diff(startDate, 'days');
    const { aggregationPeriod, periodCount } = getAggregationPeriodAndCount(daysDiff);


    const aggregations = {};
    typeCountingResult.aggregations = {}
    let currentPeriodStart = moment(startDate);

    for (let i = 0; i < periodCount; i++) {
        let periodEnd = getPeriodEnd(currentPeriodStart, aggregationPeriod);
        if (periodEnd.isAfter(endDate)) {
            periodEnd = moment(endDate);
        }

        const shopsInPeriod = shopsInRange.filter(shop =>
            moment(shop.joinDate).isBetween(currentPeriodStart, periodEnd, null, '[]')
        );

        const countingFilters = [
            { label: "productShops", conditions: [{ fieldName: "type", fieldValue: "product" }] },
            { label: "foodShops", conditions: [{ fieldName: "isFood", fieldValue: true }, { fieldName: "type", fieldValue: "product" }] },
            { label: "nonFoodShops", conditions: [{ fieldName: "isFood", fieldValue: false }, { fieldName: "type", fieldValue: "product" }] },
            { label: "serviceShops", conditions: [{ fieldName: "type", fieldValue: "service" }] },

        ];
        const periodCounts = countObjectsByArrayOfFilters(shopsInPeriod, countingFilters);
        periodCounts.result.productShops = {
            foodShops: periodCounts.result.foodShops,
            nonFoodShops: periodCounts.result.nonFoodShops,
            total: parseInt(periodCounts.result.foodShops) + parseInt(periodCounts.result.nonFoodShops)
        }
        delete periodCounts.result.foodShops; delete periodCounts.result.nonFoodShops
        aggregations[currentPeriodStart.format('YYYY-MM-DD')] = {
            ...periodCounts.result,
        };

        currentPeriodStart.add(1, aggregationPeriod);
    }

    typeCountingResult.aggregations = aggregations
    typeCountingResult.dateRange = {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        aggregationPeriod
    }
    return typeCountingResult
}


function groupProductsByType(queryObject, filterCategories, categoryMap, allDocuments, countingResults) {
    const countingFilters = [
        { label: "foodProducts", conditions: [{ fieldName: "isFood", fieldValue: true }, { fieldName: "type", fieldValue: "product" }] },
        { label: "nonFoodProducts", conditions: [{ fieldName: "isFood", fieldValue: false }, { fieldName: "type", fieldValue: "product" }] },
    ];
    const typeCountingResult = countObjectsByArrayOfFilters(allDocuments.result, countingFilters)
    let allFoodProducts = { result: [] }
    let allNonFoodProducts = { result: [] }
    let allServiceShops = { result: [] }
    allFoodProducts.result = allDocuments.result.filter(shop => shop.type == "product" && shop.isFood == true);
    allFoodProducts = groupByCategories(queryObject, filterCategories, categoryMap, allFoodProducts)

    allNonFoodProducts.result = allDocuments.result.filter(shop => shop.type == "product" && shop.isFood == false);
    allNonFoodProducts = groupByCategories(queryObject, filterCategories, categoryMap, allNonFoodProducts)

    countingResults.type = {}
    countingResults.type = {
        foodProducts: { ...allFoodProducts, total: typeCountingResult.result.foodProducts },
        nonFoodProducts: { ...allNonFoodProducts, total: typeCountingResult.result.nonFoodProducts },
        total: typeCountingResult.result.foodProducts + typeCountingResult.result.nonFoodProducts
    };
    return countingResults
}


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


function groupByCategories(queryObject, filterCategories, categoryMap, allDocuments) {
    let countingResults = {}
    for (const category of filterCategories) {
        if (queryObject[category]) {
            let filters = generateFilters(category, categoryMap);
            let result = countObjectsByArrayOfFilters(allDocuments.result, filters);
            countingResults[category] = result.result;
        }
    }
    return countingResults
}


function groupByCities(allDocuments, filterCategories, categoryMap) {
    let countingResults = {}

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
    return countingResults
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