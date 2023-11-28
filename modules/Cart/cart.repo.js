let cartModel = require("./cart.model");
let variationRepo = require("../Variation/variation.repo")
const i18n = require('i18n');
const mongoose = require("mongoose");


exports.find = async (filterObject) => {
    try {
        const resultObject = await cartModel.findOne(filterObject).lean();
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
        let resultObject = await cartModel.findOne(filterObject).lean()
            .populate({ path: "customer", select: "name image" })
            .populate({
                path: "items",
                populate: [
                    { path: "shop", select: "nameEn nameAr image" },
                    { path: "product", select: "nameEn nameAr" },
                    { path: "variation", select: "stock packages descriptionEn descriptionAr images fields" }
                ]
            })
            .select(selectionObject)


        if (!resultObject)
            resultObject = await cartModel.findOneAndUpdate(filterObject,
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

        const resultArray = await cartModel.find(filterObject).lean()
            .populate({ path: "customer", select: "name image" })
            .populate({
                path: "items",
                populate: [
                    { path: "shop", select: "nameEn nameAr image" },
                    { path: "product", select: "nameEn nameAr" },
                    { path: "variation", select: "stock packages descriptionEn descriptionAr images fields" }
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

        const count = await cartModel.count(filterObject);
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


exports.addItemToList = async (customerId, itemId, quantity) => {
    try {
        let variationResultObject = await variationRepo.find({ _id: itemId });
        if (!variationResultObject?.success) return { success: false, code: 404, error: i18n.__("notFound") }
        if (variationResultObject?.result?.stock <= 0) return { success: false, code: 409, error: i18n.__("outOfStock") }

        let cartResultObject = await this.get({ customer: customerId });
        if (!cartResultObject.success) return cartResultObject

        let isItemInCart = await this.isItemInCart(cartResultObject.result.items, itemId);
        if (isItemInCart?.success) return cartResultObject

        let newQuantity = variationResultObject.result.defaultPackage.quantity + quantity
        let newItemTotal = variationResultObject.result.defaultPackage.price
        let updatedCart = {
            $addToSet: {
                items: {
                    shop: variationResultObject.result.shop,
                    product: variationResultObject.result.product,
                    variation: itemId,
                    quantity: newQuantity,
                    itemTotal: newItemTotal
                }
            },
            $inc: {
                itemsTotal: newItemTotal,
                originalItemsTotal: newItemTotal
            }
        }
        cartResultObject = await this.updateDirectly(cartResultObject.result._id, updatedCart)

        return {
            success: true,
            result: cartResultObject,
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

        const cartResultObject = await this.get({ customer: customerId });
        if (!cartResultObject.success) return cartResultObject;


        const isItemInCart = await this.isItemInCart(cartResultObject.result.items, itemId);
        if (!isItemInCart.success) return cartResultObject;

        const updatedCart = await this.updateDirectly(cartResultObject.result._id, { $pull: { items: { variation: itemId } } });

        return {
            success: true,
            result: updatedCart.result,
            code: 200 // Use 200 for a successful removal
        };
    } catch (err) {
        console.error(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
};



exports.isItemInCart = async (arrayOfItemsObjects, itemId) => {
    try {
        itemId = mongoose.Types.ObjectId(itemId);
        const itemIndex = arrayOfItemsObjects.findIndex(itemObject => itemObject.variation.equals(itemId))

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

        const resultObject = await cartModel.findByIdAndUpdate({ _id }, formObject, { new: true });

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
        const resultObject = await cartModel.findByIdAndUpdate({ _id }, formObject, { new: true })
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
        const resultObject = await cartModel.findByIdAndDelete({ _id })

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