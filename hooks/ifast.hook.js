const orderRepo = require("../modules/Order/order.repo")
const requestRepo = require("../modules/Request/request.repo")
const { findObjectInArray } = require("../helpers/cart.helper")
const statusEnums = ["Order Placed", "Delivered", "Out For Delivery", "Cancelled",
    "To be Picked Up", "Return Attempt", "Return to Origin", "Returned to Origin"]

exports.updateOrderShipmentStatus = async (req, res) => {
    try {
        let status 
        let orderObject = await orderRepo.find({ shipments: req.body.track_id })
        if (!orderObject.success) {
            let requestObject = await requestRepo.find({ shippingId: req.body.track_id })
            status = handleStatus(req.body.Status) || requestObject.result.status
            requestRepo.updateDirectly(requestObject.result._id.toString(), { shippingStatus: req.body.Status, status })
        }

        let subOrderObject = findObjectInArray(orderObject.result.subOrders, "shippingId", req.body.track_id)
        if (!subOrderObject.success) return res.status(404).json({ success: false, code: 404 })

        let subOrders
        orderObject.result.subOrders[subOrderObject.index].shippingStatus = req.body.Status
        orderObject.result.subOrders[subOrderObject.index].status = handleStatus(req.body.Status) || subOrderObject.result.status
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


function handleStatus(ifastStausText) { 
    let status = undefined

    return status
}