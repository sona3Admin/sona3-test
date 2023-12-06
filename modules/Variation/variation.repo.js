const i18n = require('i18n');
const variationModel = require("./variation.model")
const { prepareQueryObjects } = require("../../helpers/query.helper")
const productRepo = require("../Product/product.repo")

exports.find = async (filterObject) => {
    try {
        const resultObject = await variationModel.findOne(filterObject).lean();
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
        const resultObject = await variationModel.findOne(filterObject).lean()
            .populate({ path: "seller", select: "userName image" })
            .populate({ path: "shop", select: "nameEn nameAr image" })
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
        let normalizedQueryObjects = prepareQueryObjects(filterObject, sortObject)
        filterObject = normalizedQueryObjects.filterObject
        sortObject = normalizedQueryObjects.sortObject
        const resultArray = await variationModel.find(filterObject).lean()
            .populate({ path: "seller", select: "userName image" })
            .populate({ path: "shop", select: "nameEn nameAr image" })
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
        const uniqueObjectResult = await this.isObjectUninque(formObject);
        if (!uniqueObjectResult.success) return uniqueObjectResult

        const resultObject = new variationModel(formObject);
        await resultObject.save();
        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
        let productFormObject = { $push: { variations: resultObject._id } }
        if (resultObject.isDefault) productFormObject.defaultVariation = resultObject._id
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


exports.update = async (_id, formObject) => {
    try {
        const existingObject = await this.find({ _id });
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        if (formObject.fields || formObject.quantity || formObject.price) {
            formObject._id = existingObject.result._id.toString()
            formObject.fields = formObject.fields ? formObject.fields : existingObject.result.fields;
            formObject.quantity = formObject.quantity ? formObject.quantity : existingObject.result.quantity;
            formObject.price = formObject.price ? formObject.price : existingObject.result.price;

            const uniqueObjectResult = await this.isVariationUnique(formObject)
            if (!uniqueObjectResult.success) return uniqueObjectResult
        }

        const resultObject = await variationModel.findByIdAndUpdate({ _id }, formObject, { new: true });

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
        let productFormObject = { $addToSet: { variations: resultObject._id } }
        if (resultObject.isDefault) productRepo.updateDirectly(resultObject.product, productFormObject)
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
        const existingObject = await this.find({ _id });
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        };

        const resultObject = await variationModel.findByIdAndUpdate({ _id }, { isActive: false });
        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };

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


exports.isObjectUninque = async (formObject) => {
    try {
        const similarObjects = await variationModel.find({
            product: formObject.product,
            quantity: formObject.quantity,
            price: formObject.price
        });

        if (similarObjects && similarObjects.length > 0) {
            const newVariationValues = formObject.fields.map(field => field.value);

            for (const similarObject of similarObjects) {
                const existingVariationValues = similarObject.fields.map(field => field.value);
                if (arraysEqual(newVariationValues, existingVariationValues)) return {
                    success: false,
                    code: 409,
                    error: i18n.__("variationExists"),
                };

            }
        }

        return {
            success: true,
            code: 200
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


exports.isVariationUnique = async (formObject) => {
    try {
        const similarObjects = await variationModel.find({
            product: formObject.product,
            quantity: formObject.quantity,
            price: formObject.price
        });

        if (similarObjects && similarObjects.length > 0) {
            const newVariationValues = formObject.fields.map(field => field.value);

            for (let index = 0; index < similarObjects.length; index++) {
                const existingVariationValues = similarObjects[index].fields.map(field => field.value);
                if (arraysEqual(newVariationValues, existingVariationValues) &&
                    formObject._id.toString() !== similarObjects[index]._id.toString()) {
                    return {
                        success: false,
                        code: 409,
                        error: i18n.__("variationExists"),
                    };
                }
            }
        }

        return {
            success: true,
            code: 200
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


function arraysEqual(firstArray, secondArray) {
    return (firstArray.length === secondArray.length
        && firstArray.every((value, index) => value === secondArray[index]));
}
