let bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const i18n = require('i18n');
let sellerModel = require("./seller.model")
let saltrounds = 5;
const { prepareQueryObjects } = require("../../helpers/query.helper")
const shopRepo = require('../Shop/shop.repo');
const productRepo = require('../Product/product.repo');
const serviceRepo = require('../Service/service.repo');
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.find = async (filterObject) => {
    try {
        const resultObject = await sellerModel.findOne(filterObject).lean();
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
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
    }

}


exports.get = async (filterObject, selectionObject) => {
    try {
        let resultObject = await sellerModel.findOne(filterObject).lean()
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
        logInTestEnv(`err.message`, err.message);
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
        let resultArray = await sellerModel.find(filterObject).lean()
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        let count = await sellerModel.count(filterObject);
        return {
            success: true,
            code: 200,
            result: resultArray,
            count
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}

exports.listAndPopulateShop = async (filterObject, selectionObject, sortObject, pageNumber, limitNumber) => {
    try {
        let normalizedQueryObjects = await prepareQueryObjects(filterObject, sortObject);
        filterObject = normalizedQueryObjects.filterObject;

        if (filterObject && filterObject._id && typeof filterObject._id === "string") {
            filterObject._id = new mongoose.Types.ObjectId(filterObject._id);
        }


        let resultArray = await sellerModel.aggregate([
            { $match: filterObject },
            { $skip: (pageNumber - 1) * limitNumber },
            { $limit: limitNumber },
            {
                $lookup: {
                    from: "shops",
                    localField: "_id",
                    foreignField: "seller",
                    as: "shopDetails",
                }
            },
            {
                $project: {
                    ...selectionObject,
                    shop: {
                        _id: { $arrayElemAt: ["$shopDetails._id", 0] },
                        nameEn: { $arrayElemAt: ["$shopDetails.nameEn", 0] },
                        nameAr: { $arrayElemAt: ["$shopDetails.nameAr", 0] }
                    }
                }
            }
        ]);

        let count = await sellerModel.countDocuments(filterObject);

        return {
            success: true,
            code: 200,
            result: resultArray,
            count
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
};




exports.count = async (filterObject, sortObject) => {
    try {
        let normalizedQueryObjects = await prepareQueryObjects(filterObject, sortObject)
        filterObject = normalizedQueryObjects.filterObject
        const count = await sellerModel.count(filterObject);
        return {
            success: true,
            code: 200,
            result: count
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.create = async (formObject) => {
    try {
        formObject = this.convertToLowerCase(formObject)
        const uniqueObjectResult = await this.isObjectUninque(formObject);
        if (!uniqueObjectResult.success) return uniqueObjectResult
        const resultObject = new sellerModel(formObject);
        await resultObject.save();

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }

        return {
            success: true,
            code: 201,
            result: resultObject,
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.update = async (_id, formObject) => {
    try {
        formObject = this.convertToLowerCase(formObject)
        let existingObject = await this.find({ _id })
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        if (formObject.email) {
            const uniqueObjectResult = await this.isEmailUnique(formObject, existingObject)
            if (!uniqueObjectResult.success) return uniqueObjectResult
        }

        if (formObject.userName) {
            formObject.userName = formObject.userName ? formObject.userName : existingObject.result.userName;
            const uniqueObjectResult = await this.isNameUnique(formObject, existingObject)
            if (!uniqueObjectResult.success) return uniqueObjectResult
        }

        let resultObject = await sellerModel.findByIdAndUpdate({ _id }, formObject, { new: true, select: "-password -token" })

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }

        if (formObject.isSubscribed == false) {
            shopRepo.updateMany({ seller: existingObject.result._id.toString() }, { isActive: false });
            if (existingObject.result.type === "product") productRepo.updateMany({ seller: existingObject.result._id.toString() }, { isActive: false });
            else if (existingObject.result.type === "service") serviceRepo.updateMany({ seller: existingObject.result._id.toString() }, { isActive: false });
        }

        return {
            success: true,
            code: 200,
            result: resultObject
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.updateDirectly = async (_id, formObject) => {
    try {
        let resultObject = await sellerModel.findByIdAndUpdate({ _id }, formObject, { new: true, select: "-password -token" })
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
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.updateManyById = async (arrayOfIds, formObject) => {
    try {
        const objectIds = arrayOfIds.map(id => mongoose.Types.ObjectId(id));

        await sellerModel.updateMany({ _id: { $in: objectIds } }, { $set: formObject });

        return {
            success: true,
            code: 200
        };
    } catch (err) {
        logInTestEnv(`Error stack trace:`, err.stack); // Provide detailed error
        logInTestEnv(`err.message`, err.message); // Detailed error message
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
};


exports.remove = async (_id) => {
    try {
        let existingObject = await this.find({ _id })
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        let resultObject = await sellerModel.findByIdAndUpdate({ _id }, { isDeleted: true })

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
        shopRepo.removeMany({ seller: _id });

        return {
            success: true,
            code: 200,
            result: { message: i18n.__("recordDeleted") }
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.updateBlockState = async (_id, newState) => {
    try {
        let existingObject = await this.find({ _id })
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        let resultObject = await sellerModel.findByIdAndUpdate({ _id }, { isActive: newState })

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
        shopRepo.updateBlockState({ seller: _id }, newState);

        return {
            success: true,
            code: 200,
            result: { message: i18n.__("stateUpdatedSuccessfully") }
        };

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.comparePassword = async (emailOrUsernameString, passwordString) => {
    try {
        emailOrUsernameString = emailOrUsernameString.toLowerCase()
        let existingObject = await this.find({
            $or: [
                { email: emailOrUsernameString, isDeleted: false },
                { userName: emailOrUsernameString, isDeleted: false }
            ]
        })

        if (!existingObject.success || !existingObject.result.password) return {
            success: false,
            code: 409,
            error: i18n.__("invalidEmailOrPassword")
        }

        let matchingPasswords = await bcrypt.compare(passwordString, existingObject.result.password)
        if (!matchingPasswords) return {
            success: false,
            code: 409,
            error: i18n.__("invalidEmailOrPassword")
        };

        return {
            success: true,
            result: existingObject.result,
            code: 200
        };


    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
}


exports.resetPassword = async (emailString, newPasswordString) => {
    try {
        emailString = emailString.toLowerCase()
        let existingObject = await this.find({ email: emailString })

        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        let hashedPassword = await bcrypt.hash(newPasswordString, saltrounds)
        let resultObject = await sellerModel.findOneAndUpdate({ email: emailString }, { password: hashedPassword })

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }

        return {
            success: true,
            code: 200,
            result: { message: i18n.__("successfulOperation") }
        };


    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
}


exports.isObjectUninque = async (formObject) => {
    const duplicateObject = await this.find({
        isDeleted: false,
        $or: [
            { email: formObject.email },
            { userName: formObject.userName }
        ]
    })


    if (duplicateObject.success) {
        if (duplicateObject.result.email == formObject.email) return {
            success: false,
            code: 409,
            error: i18n.__("emailUsed")
        }

        if (duplicateObject.result.userName == formObject.userName) return {
            success: false,
            code: 409,
            error: i18n.__("nameUsed")
        }
    }

    return {
        success: true,
        code: 200
    }
}


exports.isEmailUnique = async (formObject, existingObject) => {

    if (formObject.email !== existingObject.result.email) {
        const duplicateObject = await this.find({ email: formObject.email, isDeleted: false })
        if (duplicateObject.success &&
            duplicateObject.result._id.toString() !== existingObject.result._id.toString()) return {
                success: false,
                code: 409,
                error: i18n.__("emailUsed")
            }
    }
    return {
        success: true,
        code: 200
    }

}


exports.isNameUnique = async (formObject, existingObject) => {

    const duplicateObject = await this.find({ userName: formObject.userName, isDeleted: false });

    if (duplicateObject.success &&
        duplicateObject.result._id.toString() !== existingObject.result._id.toString()) {
        return {
            success: false,
            code: 409,
            error: i18n.__("nameUsed")
        }
    }

    return {
        success: true,
        code: 200,
    }
}


exports.convertToLowerCase = (formObject) => {
    if (formObject.email) formObject.email = formObject.email.toLowerCase()
    if (formObject.userName) formObject.userName = formObject.userName.toLowerCase()
    return formObject
}
