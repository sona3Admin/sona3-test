const i18n = require('i18n');
const batchModel = require("./batch.model")


exports.find = async (filterObject) => {
  try {
    const resultObject = await batchModel.findOne(filterObject).lean();
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
    const resultObject = await batchModel.findOne(filterObject).lean().select(selectionObject)

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
    const resultArray = await batchModel.find(filterObject).lean()
      .sort(sortObject)
      .select(selectionObject)
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber);

    if (!resultArray) return {
      success: false,
      code: 404,
      error: i18n.__("notFound")
    }

    const count = await batchModel.count(filterObject);
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
    const resultObject = new batchModel(formObject);
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
    const resultObject = await batchModel.findByIdAndUpdate({ _id }, formObject, { new: true })

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
    const resultObject = await batchModel.findByIdAndDelete({ _id })

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


exports.removeMany = async (filterObject) => {
  try {
    const resultObject = await batchModel.remove(filterObject)

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