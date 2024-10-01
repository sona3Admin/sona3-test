let wishlistModel = require("./wishlist.model");
let variationRepo = require("../Variation/variation.repo")
const i18n = require('i18n');
const mongoose = require("mongoose");


exports.find = async (filterObject) => {
    try {
        const resultObject = await wishlistModel.findOne(filterObject).lean();
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
        let resultObject = await wishlistModel.findOne(filterObject).lean()
            .populate({ path: "customer", select: "name image" })
            .populate({
                path: "items",
                populate: [
                    { path: "shop", select: "nameEn nameAr image isVerified" },
                    { path: "product", select: "nameEn name isFood isVerified" }
                ]
            })
            .select(selectionObject)


        if (!resultObject)
            resultObject = await wishlistModel.findOneAndUpdate(filterObject,
                { $setOnInsert: { customer: filterObject.customer } },
                { upsert: true, new: true }
            ).lean();

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

        const resultArray = await wishlistModel.find(filterObject).lean()
            .populate({ path: "customer", select: "name image" })
            .populate({
                path: "items",
                populate: [
                    { path: "shop", select: "nameEn nameAr image isVerified" },
                    { path: "product", select: "nameEn nameAr isFood isVerified" }
                ]
            })
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const count = await wishlistModel.count(filterObject);
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


exports.addItemToList = async (customerId, itemId) => {
    try {
        let variationResultObject = await variationRepo.find({ _id: itemId });
        if (!variationResultObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        let wishlistResultObject = await this.get({ customer: customerId });
        if (!wishlistResultObject.success) return wishlistResultObject

        let isItemInWishlist = await this.isItemInWishlist(wishlistResultObject.result.items, itemId);
        if (isItemInWishlist.success) return wishlistResultObject

        wishlistResultObject = await this.updateDirectly(wishlistResultObject.result._id, { $addToSet: { items: itemId } })
        return {
            success: true,
            result: wishlistResultObject.result,
            code: 201
        }
    }
    catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
}


exports.removeItemFromList = async (customerId, itemId) => {
    try {
        let wishlistResultObject = await this.find({ customer: customerId });
        if (!wishlistResultObject.success) return wishlistResultObject

        let isItemInWishlist = await this.isItemInWishlist(wishlistResultObject.result.items, itemId);

        if (!isItemInWishlist.success) return wishlistResultObject

        wishlistResultObject = await this.updateDirectly(wishlistResultObject.result._id, { $pull: { items: itemId } })
        return {
            success: true,
            result: wishlistResultObject.result,
            code: 201
        }

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
}


exports.isItemInWishlist = async (arrayOfItemIds, itemId) => {
    try {
        itemId = mongoose.Types.ObjectId(itemId);
        const itemIndex = arrayOfItemIds.findIndex(id => id.equals(itemId))

        if (itemIndex !== -1) return {
            success: true,
            result: itemIndex,
            code: 200
        };

        return {
            success: false,
            error: i18n.__("notFound"),
            code: 404
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
        const existingObject = await this.find({ _id });
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        const resultObject = await wishlistModel.findByIdAndUpdate({ _id }, formObject, { new: true });

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };


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
        const resultObject = await wishlistModel.findByIdAndUpdate({ _id }, formObject, { new: true })
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

exports.updateMany = async (filterObject, formObject) => {
    try {
        const resultObject = await wishlistModel.updateMany(filterObject, formObject)
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
        const resultObject = await wishlistModel.findByIdAndDelete({ _id })

        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

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