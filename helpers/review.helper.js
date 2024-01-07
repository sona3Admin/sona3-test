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
    let reviewsArray = await reviewRepo.list({ ...itemToReview })
    let { rating, reviewCount } = this.calculateAverageRating(reviewsArray.result)
    console.log(`customers rating`, rating);
    console.log(`itemToReview`, itemToReview);
    console.log(`reviewObject`, reviewObject);

    if (itemToReview.shop) shopRepo.updateDirectly(itemToReview.shop, { reviewCount, rating })

    if (itemToReview.product) productRepo.updateDirectly(itemToReview.product, { reviewCount, rating })

    if (itemToReview.service) serviceRepo.updateDirectly(itemToReview.service, { reviewCount, rating })

}


exports.calculateAverageRating = (arrayOfReviews) => {
    let totalRating = 0;
    let reviewCount = 0;

    arrayOfReviews.forEach((reviewObject) => {
        totalRating += parseFloat(reviewObject.rating);
        reviewCount += 1;
    });

    const rating = reviewCount === 0 ? 0 : parseFloat((totalRating / reviewCount).toFixed(2));

    return { rating, reviewCount };
};
