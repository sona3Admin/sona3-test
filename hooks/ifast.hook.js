const orderRepo = require("../modules/Order/order.repo")
const { findObjectInArray } = require("../helpers/cart.helper")



exports.updateOrderShipmentStatus = async (req, res) => {
    try {
        // console.log("req.body", req.body)
        let orderObject = await orderRepo.find({ shipments: req.body.track_id })

        let subOrderObject = findObjectInArray(orderObject.result.subOrders, "shippingId", req.body.track_id)

        if (!subOrderObject.success) return res.status(404).json({ success: false, code: 404 })

        let subOrders
        orderObject.result.subOrders[subOrderObject.index].status = ""
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