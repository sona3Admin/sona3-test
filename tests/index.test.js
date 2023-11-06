const adminAppTests = require("./admin/index.test")
const customerAppTests = require("./customer/index.test")
const sellerAppTests = require("./seller/index.test")


describe("Testing the Sona3 Project Endpoints => /api/v1/*", () => {
    adminAppTests;
    customerAppTests;
    sellerAppTests;
})