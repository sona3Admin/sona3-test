const authTests = require("./auth.test")
const sellerTests = require("./seller.test")


describe("Testing Seller App End Points => /api/v1/seller/*", () => {
    authTests;
    sellerTests;
})