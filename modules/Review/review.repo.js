const i18n = require('i18n');
const reviewModel = require("./review.model")
const { prepareQueryObjects } = require("../../helpers/query.helper")
const { defineReviewedItem, getPurchasedOrder, updateReviewedItemRating } = require("../../helpers/review.helper")


exports.find = async (filterObject) => {
    try {
        const resultObject = await reviewModel.findOne(filterObject).lean();
        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        return {
            success: true,
            code: 200,
            result: resultObject
        }

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
    }

}


exports.get = async (filterObject, selectionObject) => {
    try {
        const resultObject = await reviewModel.findOne(filterObject).lean()
            .populate({ path: "customer", select: "name image" })
            .populate({ path: "shop", select: "nameEn nameAr image" })
            .populate({ path: "product", select: "nameEn nameAr variations defaultVariation" })
            .populate({ path: "service", select: "nameEn nameAr images" })
            .select(selectionObject)

        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        return {
            success: true,
            code: 200,
            result: resultObject,
        };

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.list = async (filterObject, selectionObject, sortObject, pageNumber, limitNumber) => {
    try {
        let normalizedQueryObjects = prepareQueryObjects(filterObject, sortObject)
        filterObject = normalizedQueryObjects.filterObject
        sortObject = normalizedQueryObjects.sortObject
        const resultArray = await reviewModel.find(filterObject).lean()
            .populate({ path: "customer", select: "name image" })
            .populate({ path: "shop", select: "nameEn nameAr image" })
            .populate({ path: "product", select: "nameEn nameAr variations defaultVariation" })
            .populate({ path: "service", select: "nameEn nameAr images" })
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const count = await reviewModel.count(filterObject);
        return {
            success: true,
            code: 200,
            result: resultArray,
            count
        };

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.create = async (formObject) => {
    try {
        let itemToReview = defineReviewedItem(formObject);
        console.log(`itemToReview`, itemToReview);
        let existingReviewObject = await this.get({ customer: formObject.customer, ...itemToReview })
        console.log(`existingReviewObject`, existingReviewObject);

        if (existingReviewObject.success) return { success: false, code: 409, error: i18n.__("reviewExists") }

        let existingOrderObject = await getPurchasedOrder(formObject, itemToReview)
        console.log(`existingOrderObject`, existingOrderObject);

        if (!existingOrderObject.success) return { success: false, code: 409, error: i18n.__("notPurchased") }

        const resultObject = new reviewModel(formObject);
        await resultObject.save();


        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }

        updateReviewedItemRating(formObject, itemToReview);

        return {
            success: true,
            code: 201,
            result: resultObject,
        };

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.update = async (_id, formObject) => {
    try {
        let itemToReview = defineReviewedItem(formObject);
        const existingObject = await this.find({ _id });
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        const resultObject = await reviewModel.findByIdAndUpdate({ _id }, formObject, { new: true });

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };

        if (formObject.rating) updateReviewedItemRating(formObject, itemToReview);

        return {
            success: true,
            code: 200,
            result: resultObject
        };
    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
};


exports.updateDirectly = async (_id, formObject) => {
    try {
        const resultObject = await reviewModel.findByIdAndUpdate({ _id }, formObject, { new: true })
        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        return {
            success: true,
            code: 200,
            result: resultObject
        };

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.remove = async (_id) => {
    try {
        const resultObject = await this.find({ _id })

        if (!resultObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }
        itemToReview = { [resultObject.result.reviewOn]: (resultObject.result[resultObject.result.reviewOn]).toString() }
        updateReviewedItemRating(resultObject.result, itemToReview);
        await reviewModel.findByIdAndDelete({ _id })

        return {
            success: true,
            code: 200,
            result: { message: i18n.__("recordDeleted") }
        };

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}

