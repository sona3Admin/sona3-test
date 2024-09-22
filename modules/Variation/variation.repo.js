const i18n = require('i18n');
const variationModel = require("./variation.model")
const { prepareQueryObjects } = require("../../helpers/query.helper")
const productRepo = require("../Product/product.repo")
const wishlistRepo = require("../Wishlist/wishlist.repo")
const basketRepo = require("../Basket/basket.repo")
const cartRepo = require("../Cart/cart.repo")


exports.find = async (filterObject) => {
    try {
        console.log("filterObject", filterObject)
        const resultObject = await variationModel.findOne(filterObject).lean();
        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }
        console.log("resultObject", resultObject)
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
        const resultObject = await variationModel.findOne(filterObject).lean()
            .populate({ path: "seller", select: "userName image fcmToken" })
            .populate({ path: "shop", select: "nameEn nameAr image isVerified isActive" })
            .populate({ path: "product", select: "-variations -defaultVariation -shop" })
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
        let normalizedQueryObjects = await prepareQueryObjects(filterObject, sortObject)
        filterObject = normalizedQueryObjects.filterObject
        sortObject = normalizedQueryObjects.sortObject
        console.log("filterObject", filterObject)
        const resultArray = await variationModel.find(filterObject).lean()
            .populate({ path: "seller", select: "userName image" })
            .populate({ path: "shop", select: "nameEn nameAr image isVerified isActive" })
            .populate({ path: "product", select: "-variations -defaultVariation -shop" })
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const count = await variationModel.count(filterObject);
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

        const productObject = await productRepo.find({ _id: formObject.product, seller: formObject.seller, shop: formObject.shop })
        if (!productObject.success) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
        const resultObject = new variationModel(formObject);
        await resultObject.save();
        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
        let productFormObject = { $push: { variations: resultObject._id }, $inc: { stock: resultObject.stock } }
        if (resultObject.isDefault) {
            productFormObject.defaultVariation = resultObject._id
            let discountValue = resultObject.minPackage.originalPrice - resultObject.minPackage.price
            productFormObject.discountValue = discountValue
        }
        productRepo.updateDirectly(resultObject.product, productFormObject)
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


exports.update = async (filterObject, formObject) => {
    try {
        console.log("filterObject", filterObject)
        console.log("formObject", formObject)
        const existingObject = await this.find(filterObject);
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        const resultObject = await variationModel.findByIdAndUpdate({ _id: filterObject._id }, formObject, { new: true });

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };

        let productFormObject = { $addToSet: { variations: resultObject._id } }

        if (formObject.isDefault) {
            let discountValue = resultObject.minPackage.originalPrice - resultObject.minPackage.price
            productRepo.updateDirectly(resultObject.product.toString(), { ...productFormObject, discountValue, defaultVariation: _id })
        }

        if (!resultObject?.isActive && formObject?.isActive) productRepo.updateDirectly(resultObject.product.toString(), { ...productFormObject, $inc: { stock: resultObject.stock } })

        if (formObject?.isActive == false) {
            let productUpdateObject = { $pull: { variations: resultObject._id, $inc: { stock: -(resultObject.stock) } } }
            let defaultVariationOfProduct = await productRepo.find({ defaultVariation: filterObject._id })
            if (defaultVariationOfProduct.success) productUpdateObject.$unset = { defaultVariation: true }
            productRepo.updateDirectly(resultObject.product.toString(), productUpdateObject)
        }
        console.log("resultObject", resultObject)

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
        const resultObject = await variationModel.findByIdAndUpdate({ _id }, formObject, { new: true })
        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        let productFormObject = { $addToSet: { variations: resultObject._id } }
        if (resultObject.isDefault) productRepo.updateDirectly(resultObject.product, productFormObject)
        if (formObject.isActive == true) productRepo.updateDirectly(resultObject.product, { ...productFormObject, $inc: { stock: resultObject.stock } })
        if (formObject?.isActive == false) productRepo.updateDirectly(resultObject.product, { $pull: { variations: resultObject._id, $inc: { stock: -(resultObject.stock) } } })

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


exports.updateBlockState = async (filterObject, newState) => {
    try {
        const resultObject = await variationModel.updateMany(filterObject, { isActive: newState })

        if (newState == false) {
            const existingArray = await variationModel.find(filterObject);
            existingArray.forEach(async (variation) => {
                wishlistRepo.updateMany({}, { $pull: { items: variation._id } })
                cartRepo.updateManyCarts(variation.shop, variation._id)
                basketRepo.updateManyCarts(variation.shop, variation._id)
            });

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


exports.removeMany = async (filterObject) => {
    try {
        const existingArray = await variationModel.find(filterObject);
        const resultObject = await variationModel.updateMany(filterObject, { isDeleted: true, stock: 0 })

        existingArray.forEach(async (variation) => {
            wishlistRepo.updateMany({}, { $pull: { items: variation._id } })
            cartRepo.updateManyCarts(variation.shop, variation._id)
            basketRepo.updateManyCarts(variation.shop, variation._id)
        });

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


exports.remove = async (filterObject) => {
    try {
        const existingObject = await this.find(filterObject);
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        const resultObject = await variationModel.findByIdAndUpdate({ _id: filterObject._id }, { isDeleted: true, stock: 0 });
        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };

        let productUpdateObject = { $pull: { variations: resultObject._id, $inc: { stock: -(resultObject.stock) } } }


        let defaultVariationOfProduct = await productRepo.find({ defaultVariation: filterObject._id })
        if (defaultVariationOfProduct.success) productUpdateObject.$unset = { defaultVariation: true }

        productRepo.updateDirectly(resultObject.product, productUpdateObject)

        wishlistRepo.updateMany({}, { $pull: { items: filterObject._id } })
        cartRepo.updateManyCarts(resultObject.shop, filterObject._id)
        basketRepo.updateManyCarts(resultObject.shop, filterObject._id)

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