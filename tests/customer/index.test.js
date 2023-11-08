const authTests = require("./auth.test")
const customerTests = require("./customer.test")


describe("Testing Customer App End Points => /api/v1/customer/*", () => {
    authTests;
    customerTests;
})