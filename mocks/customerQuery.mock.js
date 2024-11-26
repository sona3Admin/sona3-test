const i18n = require('i18n');
const sellerModel = require("../modules/Seller/seller.model")
const customerModel = require("../modules/Customer/customer.model")
const categoryModel = require("../modules/Category/category.model")


exports.executeQuery = async (req, res) => {
    try {
        let allMainCategories = await categoryModel.find({ isSubCategory: false })
            .populate({ path: "subCategories", select: "type" })
        // .populate({ path: "parentCategory", select: "nameEn nameAr type" })
        // let count = await categoryModel.countDocuments({ type: "product", isSubCategory: true })
        let incorrectCategories = []
        let counter = 0
        allMainCategories.forEach(async (mainCategory) => {
            counter++

            console.log(counter, "=======mainCategory.type=======", mainCategory.type)

            if (mainCategory.subCategories.length > 0) {
                console.log(counter, "=======mainCategory.type=======", mainCategory.type)

                mainCategory.subCategories.forEach(async (subCategory) => {
                    console.log(counter, "subCategory.type", subCategory.type)
                })
            }
            // if (mainCategory?.parentCategory && mainCategory?.parentCategory?.type !== mainCategory.type) {
            //     counter++
            //     console.log(counter, "mainCategory.parentCategory.type", mainCategory.parentCategory.type)
            //     console.log(counter, "mainCategory.type", mainCategory.type)
            //     incorrectCategories.push(mainCategory)
            //     // await categoryModel.findByIdAndUpdate(mainCategory._id.toString(), { $unset: { parentCategory: 1 } })
            //     // await categoryModel.findByIdAndUpdate(mainCategory.parentCategory._id.toString(), { $pull: { subCategories: productMainCategory._id.toString() } })
            // }
        });
        // const operationResultObject = await categoryModel.deleteMany({ isActive: false })
        return res.status(200).json({ success: true, allMainCategories, count: allMainCategories.length });

    } catch (err) {
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }

}
