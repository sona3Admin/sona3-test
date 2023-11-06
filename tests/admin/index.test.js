const authTests = require("./auth.test")
const adminTests = require("./admin.test")


describe("Testing Admin App End Points => /api/v1/admin/*", () => {
    authTests;
    adminTests;
})