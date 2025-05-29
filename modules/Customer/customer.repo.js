const bcrypt = require("bcrypt");
const i18n = require('i18n');
const customerModel = require("./customer.model")
const saltrounds = 5;
const { prepareQueryObjects } = require("../../helpers/query.helper")
const { logInTestEnv } = require("../../helpers/logger.helper");
const cityRepo = require("../City/city.repo")


exports.find = async (filterObject) => {
    try {
        const resultObject = await customerModel.findOne(filterObject).lean();
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
        const resultObject = await customerModel.findOne(filterObject)
            .populate({ path: "addresses.emirate", select: "nameEn nameAr firstFlightValues" })
            .lean().select(selectionObject)

        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        resultObject.addresses = resultObject.addresses.map(address => {
            if (address.emirate?.firstFlightValues?.length > 0) {
                const matchedCity = address.emirate.firstFlightValues.find(val => val._id.toString() === address.city.toString());
                if (matchedCity) {
                    address.city = matchedCity;
                }
            }
            delete address.emirate.firstFlightValues;
            return address;
        });

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
        const resultArray = await customerModel.find(filterObject).lean()
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const count = await customerModel.count(filterObject);
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


exports.count = async (filterObject, sortObject) => {
    try {
        let normalizedQueryObjects = await prepareQueryObjects(filterObject, sortObject)
        filterObject = normalizedQueryObjects.filterObject
        const count = await customerModel.count(filterObject);
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
        const uniqueObjectResult = await this.isObjectUnique(formObject);
        logInTestEnv(`uniqueObjectResult`, uniqueObjectResult);
        if (!uniqueObjectResult.success) return uniqueObjectResult


        if (formObject.addresses) {
            for (let address of formObject.addresses) {
                address.name = address.name.trim().toLowerCase();
                let emirate = await cityRepo.find({ _id: address.emirate });
                if (!emirate.success) {
                    return {
                        success: false,
                        code: 404,
                        error: i18n.__("notFound")
                    };
                }

                let firstFlightValues = emirate.result?.firstFlightValues || [];

                if (!address.city && firstFlightValues.length > 0) {
                    return {
                        success: false,
                        code: 400,
                        error: i18n.__("requiredCity")
                    };

                }
                if (address.city) {
                    const matchedCity = firstFlightValues.find(val => val._id.toString() === address.city.toString());
                    if (!matchedCity) {
                        return {
                            success: false,
                            code: 400,
                            error: i18n.__("invalidCity")
                        };
                    }
                }

                
            }
        }
        const resultObject = new customerModel(formObject);
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

exports.addAddress = async (_id, formObject) => {
    try {
        formObject.name = formObject.name.trim().toLowerCase()
        const existingObject = await this.find({ _id })
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }
        if (existingObject.result.addresses.length >= 5) {
            return {
                success: false,
                code: 400,
                error: i18n.__("maxAddressesReached"),
            };
        }
        const isNameTaken = existingObject.result.addresses.some(addr =>
            addr.name?.trim().toLowerCase() === formObject.name?.trim().toLowerCase()
        );
        if (isNameTaken) {
            return {
                success: false,
                code: 409,
                error: i18n.__("nameUsed"),
            };
        }
        let emirate = await cityRepo.find({ _id: formObject.emirate });
        if (!emirate.success) {
            return {
                success: false,
                code: 404,
                error: i18n.__("notFound")
            };
        }

        let firstFlightValues = emirate.result?.firstFlightValues || [];

        if (!formObject.city && firstFlightValues.length > 0) {
            return {
                success: false,
                code: 400,
                error: i18n.__("requiredCity")
            };

        }
        if (formObject.city) {
            const matchedCity = firstFlightValues.find(val => val._id.toString() === formObject.city.toString());
            if (!matchedCity) {
                return {
                    success: false,
                    code: 400,
                    error: i18n.__("invalidCity")
                };
            }
        }

        if (formObject.isDefault) {
            await customerModel.updateMany({ _id }, { $set: { "addresses.$[].isDefault": false } })
        }
        const resultObject = await customerModel.findByIdAndUpdate({ _id }, { $addToSet: { addresses: formObject } }, { new: true, select: "-password -token" })
        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
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

exports.updateAddress = async (_id, addressId, formObject) => {
    try {
        const existingObject = await this.find({ _id })
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        if (formObject.name) {
            formObject.name = formObject.name.trim().toLowerCase()
            const isNameTaken = existingObject.result.addresses.some(addr =>
                addr._id.toString() !== addressId && addr.name?.trim().toLowerCase() === formObject.name?.trim().toLowerCase()
            );
            if (isNameTaken) {
                return {
                    success: false,
                    code: 409,
                    error: i18n.__("nameUsed"),
                };
            }
        }

        if (formObject.emirate) {
            let emirate = await cityRepo.find({ _id: formObject.emirate });
            if (!emirate.success) {
                return {
                    success: false,
                    code: 404,
                    error: i18n.__("notFound")
                };
            }

            let firstFlightValues = emirate.result?.firstFlightValues || [];

            if (!formObject.city && firstFlightValues.length > 0) {
                return {
                    success: false,
                    code: 400,
                    error: i18n.__("requiredCity")
                };

            }
            if (formObject.city) {
                const matchedCity = firstFlightValues.find(val => val._id.toString() === formObject.city.toString());
                if (!matchedCity) {
                    return {
                        success: false,
                        code: 400,
                        error: i18n.__("invalidCity")
                    };
                }
            }
        }

        if (formObject.isDefault) {
            await customerModel.updateMany({ _id }, { $set: { "addresses.$[].isDefault": false } })
        }

        const resultObject = await customerModel.findOneAndUpdate({ _id, "addresses._id": addressId }, { $set: { "addresses.$": formObject } }, { new: true, select: "-password -token" })
        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
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

exports.removeAddress = async (_id, addressId) => {
    try {
        const existingObject = await this.find({ _id })
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }
        const addresses = existingObject.result.addresses;
        const isDeletedAddressDefault = addresses.some(addr => addr._id.toString() === addressId && addr.isDefault);
        const updatedCustomer = await customerModel.findOneAndUpdate({ _id }, { $pull: { addresses: { _id: addressId } } }, { new: true, select: "-password -token" })
        if (!updatedCustomer) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }


        if (isDeletedAddressDefault && updatedCustomer.addresses.length > 0) {
            const lastAddressId = updatedCustomer.addresses[updatedCustomer.addresses.length - 1]._id;

            await customerModel.updateOne(
                { _id, "addresses._id": lastAddressId },
                { $set: { "addresses.$.isDefault": true } }
            );
        }

        const finalResult = await customerModel.findById(_id).select("-password -token");

        return {
            success: true,
            code: 200,
            result: finalResult
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
        const existingObject = await this.find({ _id })
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        if (formObject.email) {
            const uniqueObjectResult = await this.isEmailUnique(formObject, existingObject)
            if (!uniqueObjectResult.success) return uniqueObjectResult
        }

        if (formObject.phone) {
            const uniqueObjectResult = await this.isPhoneUnique(formObject, existingObject)
            if (!uniqueObjectResult.success) return uniqueObjectResult
        }

        if (formObject.addresses) {
            for (let address of formObject.addresses) {
                address.name = address.name.trim().toLowerCase();
                let city = await cityRepo.find({ _id: address.emirate });
                if (!city.success) {
                    return {
                        success: false,
                        code: 404,
                        error: i18n.__("notFound")
                    };
                }
            }
        }

        const resultObject = await customerModel.findByIdAndUpdate({ _id }, formObject, { new: true, select: "-password -token" })

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
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
        const resultObject = await customerModel.findByIdAndUpdate({ _id }, formObject, { new: true, select: "-password -token" })
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


exports.remove = async (_id) => {
    try {
        const existingObject = await this.find({ _id })
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const resultObject = await customerModel.findByIdAndUpdate({ _id }, { isDeleted: true })

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }

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


exports.comparePassword = async (emailString, passwordString) => {
    try {
        emailString = emailString.toLowerCase()
        const existingObject = await this.get({ email: emailString, isDeleted: false }, {})

        if (!existingObject.success || !existingObject.result.password) return {
            success: false,
            code: 409,
            error: i18n.__("invalidEmailOrPassword")
        }

        const matchingPasswords = await bcrypt.compare(passwordString, existingObject.result.password)
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
        const existingObject = await this.find({ email: emailString })

        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        const hashedPassword = await bcrypt.hash(newPasswordString, saltrounds)
        const resultObject = await customerModel.findOneAndUpdate({ email: emailString }, { password: hashedPassword })

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


exports.isObjectUnique = async (formObject) => {
    let filterArray = [{ email: formObject.email }]
    if (formObject.phone) filterArray.push({ phone: formObject.phone })
    const duplicateObject = await this.find({
        $or: filterArray,
        isDeleted: false
    });

    if (duplicateObject.success && duplicateObject.result) {
        const matchedEmail = duplicateObject.result.email === formObject.email;
        const matchedPhone = duplicateObject.result.phone === formObject.phone;

        if (matchedEmail) {
            return {
                success: false,
                code: 409,
                error: i18n.__("emailUsed")
            };
        }

        if (matchedPhone) {
            return {
                success: false,
                code: 409,
                error: i18n.__("phoneUsed")
            };
        }
    }

    return {
        success: true,
        code: 200
    };
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

exports.isPhoneUnique = async (formObject, existingObject) => {

    if (formObject.phone !== existingObject.result.phone) {
        const duplicateObject = await this.find({ phone: formObject.phone, isDeleted: false })
        if (duplicateObject.success &&
            duplicateObject.result._id.toString() !== existingObject.result._id.toString()) return {
                success: false,
                code: 409,
                error: i18n.__("phoneUsed")
            }
    }
    return {
        success: true,
        code: 200
    }

}


exports.convertToLowerCase = (formObject) => {
    if (formObject.email) formObject.email = formObject.email.toLowerCase()
    return formObject
}
