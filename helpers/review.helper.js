const i18n = require('i18n')
const orderRepo = require("../modules/Order/order.repo")
const requestRepo = require("../modules/Request/request.repo")
const shopRepo = require("../modules/Shop/shop.repo")
const productRepo = require("../modules/Product/product.repo")
const serviceRepo = require("../modules/Service/service.repo")
const reviewRepo = require("../modules/Review/review.repo")


exports.defineReviewedItem = (reviewObject) => {
    let itemTypeObject
    if (reviewObject.reviewOn.toLowerCase() == "shop") itemTypeObject = { shop: reviewObject.shop }
    if (reviewObject.reviewOn.toLowerCase() == "product") itemTypeObject = { product: reviewObject.product }
    if (reviewObject.reviewOn.toLowerCase() == "service") itemTypeObject = { service: reviewObject.service }

    return itemTypeObject
}


exports.getPurchasedOrder = async (reviewObject, itemToReview) => {
    let existingItemObject
    if (itemToReview.hasOwnProperty("shop")) existingItemObject = await orderRepo.find({ customer: reviewObject.customer, "subOrders.shop": itemToReview.shop })
    if (itemToReview.hasOwnProperty("product")) existingItemObject = await orderRepo.find({ customer: reviewObject.customer, "subOrders.items.product": itemToReview.product })
    if (itemToReview.hasOwnProperty("service")) existingItemObject = await requestRepo.find({ customer: reviewObject.customer, ...itemToReview })
    return existingItemObject
}


exports.updateReviewedItemRating = async (reviewObject, itemToReview) => {
    let allReviewsArray = [];
    let numOfReviews = 0
    let reviewsArray = await reviewRepo.list({ ...itemToReview })

    if (itemToReview.hasOwnProperty("shop")) {
        let shopRating = 0
        reviewsArray.result.map((shopReview) => {
            shopRating += parseFloat(shopReview.rating)
            numOfReviews += 1
        })
    }
    if (itemToReview.hasOwnProperty("product")) {
        let productRating = 0
        reviewsArray.result.map((productReview) => {
            productRating += parseFloat(productReview.rating)
            numOfReviews += 1
        })
    }
    if (itemToReview.hasOwnProperty("service")) {
        let serviceRating = 0
        reviewsArray.result.map((serviceReview) => {
            serviceRating += parseFloat(serviceReview.rating)
            numOfReviews += 1

        })
    }
}