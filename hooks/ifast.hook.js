const orderRepo = require("../modules/Order/order.repo")
const { findObjectInArray } = require("../helpers/cart.helper")
const { logInTestEnv } = require("../helpers/logger.helper");


exports.updateOrderShipmentStatus = async (req, res) => {
    try {

        let orderObject = await orderRepo.find({ shipments: req.body.track_id })
        if (!orderObject.success) {
            return res.status(404).json({
                status: false,
                data: {
                    order_id: req.body.track_id,
                    status: req.body.Status
                }
            })
        }
        
        let subOrderObject = findObjectInArray(orderObject.result.subOrders, "shippingId", req.body.track_id)
        if (!subOrderObject.success) return res.status(404).json({
            status: false,
            data: {
                order_id: req.body.track_id,
                status: req.body.Status
            }
        })

        orderObject.result.subOrders[subOrderObject.index].shippingStatus = req.body.Status
        orderObject.result.subOrders[subOrderObject.index].status = handleStatus(req.body.Status, "order") || subOrderObject.result.status
        logInTestEnv("order status", orderObject.result.subOrders[subOrderObject.index].status)

        orderRepo.updateDirectly(orderObject.result._id.toString(), { subOrders: orderObject.result.subOrders })
        return res.status(200).json({
            status: true,
            data: {
                order_id: req.body.track_id,
                status: req.body.Status
            }
        })

    } catch (err) {
        logInTestEnv(`err.message controller`, err.message);
        return res.status(500).json({
            status: false
        });
    }
}


function handleStatus(ifastStausText, orderType) {
    let status = undefined
    if (ifastStausText == "Order Placed" && orderType == "order") status = "pending"
    if (ifastStausText == "Order Placed" && orderType == "request") status = "purchased"
    if (ifastStausText == "Delivered") status = "delivered"
    if (ifastStausText == "Cancelled") status = "canceled"
    if (ifastStausText == "Returned to Origin") status = "returned"
    if (ifastStausText == "To be Picked Up" || ifastStausText == "Out For Delivery") status = "in progress"
    if (ifastStausText == "Return Attempt" || ifastStausText == "Return to Origin") status = "to be returned"
    return status
}