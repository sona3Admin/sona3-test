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



        if (queryObject.cities) {
            for (const city of UAE_MAIN_CITIES) {
                const cityDocuments = allDocuments.result.filter(doc =>
                    doc.address.city.name && doc.address.city.name.toLowerCase() === city.toLowerCase()
                );
                const cityStats = {};
                for (const category of filterCategories) {
                    const filters = generateFilters(category);
                    const result = countObjectsByArrayOfFilters(cityDocuments, filters);
                    cityStats[category] = result.result;
                }
                countingResults[city] = cityStats;
                countingResults[city].total = cityDocuments.length;
            }
            
        } else {
            for (const category of filterCategories) {
                if (queryObject[category]) {
                    const filters = generateFilters(category);
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


function generateFilters(category) {
    const categoryMap = {
        isSubscribed: 'subscribed',
        isVerified: 'verified',
        hasSold: 'selling',
        isActive: 'active'
    };

    const baseLabel = categoryMap[category];
    const oppositeLabel = `not${baseLabel}`;

    const baseCondition = { fieldName: category, fieldValue: true };
    const oppositeCondition = { fieldName: category, fieldValue: false };
    const otherCategories = Object.keys(categoryMap).filter(c => c !== category);

    const filters = [
        { label: baseLabel, conditions: [baseCondition] },
        { label: oppositeLabel, conditions: [oppositeCondition] }
    ];

    for (const otherCategory of otherCategories) {
        const otherLabel = categoryMap[otherCategory];
        const notOtherLabel = `Not${otherLabel}`;

        filters.push(
            { label: `${baseLabel}And${otherLabel}`, conditions: [baseCondition, { fieldName: otherCategory, fieldValue: true }] },
            { label: `${baseLabel}And${notOtherLabel}`, conditions: [baseCondition, { fieldName: otherCategory, fieldValue: false }] },
            { label: `${oppositeLabel}And${otherLabel}`, conditions: [oppositeCondition, { fieldName: otherCategory, fieldValue: true }] },
            { label: `${oppositeLabel}And${notOtherLabel}`, conditions: [oppositeCondition, { fieldName: otherCategory, fieldValue: false }] }
        );
    }

    return filters;
}
