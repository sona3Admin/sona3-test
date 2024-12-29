const app = require("express").Router();
const complaintController = require("../../controllers/informative/complaint.controller")
const { createComplaintValidation } = require("../../validations/complaint.validation")
const validator = require("../../helpers/validation.helper")


app.post("/create", validator(createComplaintValidation), complaintController.createComplaint);


module.exports = app