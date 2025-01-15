const app = require("express").Router();
const complaintController = require("../../controllers/admin/complaint.controller")
const { updateComplaintValidation } = require("../../validations/complaint.validation")
const validator = require("../../helpers/validation.helper")


app.get("/list", complaintController.listComplaints);
app.get("/get", complaintController.getComplaint);
app.put("/update", validator(updateComplaintValidation), complaintController.updateComplaint);
app.delete("/remove", complaintController.removeComplaint);


module.exports = app