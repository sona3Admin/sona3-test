const orderRepo = require("../modules/Order/order.repo")
const requestRepo = require("../modules/Request/request.repo")
const { findObjectInArray } = require("../helpers/cart.helper")
const notificationHelper = require("../helpers/notification.helper")


exports.updateOrderShipmentStatus = async (req, res) => {
    try {
        let status
        
        let orderObject = await orderRepo.find({ shipments: req.body.track_id })
        if (!orderObject.success) {
            let requestObject = await requestRepo.find({ shippingId: req.body.track_id })
            status = handleStatus(req.body.Status, "request") || requestObject.result.status
            console.log("request status", status)

            requestRepo.updateDirectly(requestObject.result._id.toString(), { shippingStatus: req.body.Status, status })
            return res.status(200).json({
                status: true,
                data: {
                    order_id: req.body.track_id,
                    status: req.body.Status
                }
            })
        }

        let subOrderObject = findObjectInArray(orderObject.result.subOrders, "shippingId", req.body.track_id)
        if (!subOrderObject.success) return res.status(404).json({ success: false, code: 404 })

        let subOrders
        orderObject.result.subOrders[subOrderObject.index].shippingStatus = req.body.Status
        orderObject.result.subOrders[subOrderObject.index].status = handleStatus(req.body.Status, "order") || subOrderObject.result.status
        console.log("order status", orderObject.result.subOrders[subOrderObject.index].status)
        orderRepo.updateDirectly(orderObject.result._id.toString(), { subOrders })
        return res.status(200).json({
            status: true,
            data: {
                order_id: req.body.track_id,
                status: req.body.Status
            }
        })

    } catch (err) {
        console.log(`err.message controller`, err.message);
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