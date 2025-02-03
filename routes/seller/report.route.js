const app = require("express").Router();
const reportController = require("../../controllers/seller/report.controller")


app.get("/products", reportController.countProducts);
app.get("/services", reportController.countServices);



app.get("/ordersByDay", reportController.getOrdersStatsByDay);
app.get("/ordersByMonth", reportController.getOrdersStatsByMonth);
app.get("/requestsByDay", reportController.getServiceRequestsStatsByDay);
app.get("/requestsByMonth", reportController.getServiceRequestStatsByMonth);
app.get("/financesOrders", reportController.financesOrders);
app.get("/financesServicesRequest", reportController.financesServicesRequest);


app.get("/order", reportController.countOrders);
app.get("/request", reportController.countRequests);


module.exports = app
