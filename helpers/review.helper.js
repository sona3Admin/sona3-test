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
    console.log(`itemToReview`, itemToReview);
    if (itemToReview?.shop) {
        existingItemObject = await orderRepo.find({ customer: reviewObject.customer, shops: itemToReview.shop })
        console.log(`existingItemObject in shop`, existingItemObject);
    }

    if (itemToReview?.product) {
        existingItemObject = await orderRepo.find({ customer: reviewObject.customer, products: itemToReview.product })
        console.log(`existingItemObject in product`, existingItemObject);

    }
    if (itemToReview?.service) {
        existingItemObject = await requestRepo.find({ customer: reviewObject.customer, ...itemToReview })
        console.log(`existingItemObject in service`, existingItemObject);

    }
    console.log(`existingItemObject found`, existingItemObject);
    return existingItemObject
}


exports.updateReviewedItemRating = async (reviewObject, itemToReview) => {
    let reviewCount = 0
    let itemRating = parseFloat(reviewObject.rating)
    let reviewsArray = await reviewRepo.list({ ...itemToReview }) 
    console.log(`customer rating`, itemRating);
    console.log(`itemToReview`, itemToReview);
    console.log(`reviewObject`, reviewObject);
    if (itemToReview.shop) {
        reviewsArray.result.map((shopReview) => {
            itemRating += parseFloat(shopReview.rating)
            reviewCount += 1
        })
        console.log(`itemToReview.shop`, itemToReview.shop);
        itemRating = itemRating / reviewCount
        shopRepo.updateDirectly(itemToReview.shop, { reviewCount, rating: itemRating })
    }

    if (itemToReview.product) {
        reviewsArray.result.map((productReview) => {
            itemRating += parseFloat(productReview.rating)
            reviewCount += 1
        })
        console.log(`itemToReview.product`, itemToReview.product);

        itemRating = itemRating / reviewCount
        productRepo.updateDirectly(itemToReview.product, { reviewCount, rating: itemRating })

    }

    if (itemToReview.service) {
        reviewsArray.result.map((serviceReview) => {
            itemRating += parseFloat(serviceReview.rating)
            reviewCount += 1
        })
        console.log(`itemToReview.service`, itemToReview.service);

        itemRating = itemRating / reviewCount
        serviceRepo.updateDirectly(itemToReview.service, { reviewCount, rating: itemRating })

    }
}