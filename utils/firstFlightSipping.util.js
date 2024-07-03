const axios = require('axios');
const i18n = require('i18n');
const orderRepo = require("../modules/Order/order.repo")
const requestRepo = require("../modules/Request/request.repo")
const { getSettings, setSettings } = require("../helpers/settings.helper")


const firstFlightBaseUrl = process.env.FIRSTFLIGHT_API_URL;
const firstFlightUsername = process.env.FIRSTFLIGHT_USER_NAME;
const firstFlightPassword = process.env.FIRSTFLIGHT_PASSWORD;
const firstFlightAccountNumber = process.env.FIRSTFLIGHT_ACCOUNT_NUMBER;
const firstFlightCountry = process.env.FIRSTFLIGHT_COUNTRY;


const authData = {
    UserName: firstFlightUsername,
    Password: firstFlightPassword,
    AccountNo: firstFlightAccountNumber,
    Country: firstFlightCountry,
}


exports.createNewBulkOrder = async (orderDetailsObject, isCod) => {
    try {

        console.log('Creating New Order...');
        orderDetailsObject.subOrders.forEach(async (subOrder) => {
            let orderData = await this.handleOrderData(orderDetailsObject, subOrder, isCod, orderDetailsObject)
            const response = await axios.post(`${firstFlightBaseUrl}/CreateAirwayBill`, orderData, {
                headers: { 'Content-Type': 'application/json' }
            });
        })


        // console.log('Order created successfully:', response.data);
        return {
            success: true,
            code: 201,
            // result: response.data,
            // orderData
        };

    } catch (err) {
        console.log('err.message', err.message)
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
}


exports.calculateOrderShippingCost = async (orderDetailsObject) => {
    try {

        console.log('calculateOrderShippingCost...');
        let originCity = orderDetailsObject.shippingAddress.address.cityCode;
        let shippingCost = { total: 0 };
        orderDetailsObject.subOrders.forEach(async (subOrder) => {
            let destinationCity = subOrder.address.cityCode
            let subOrderCost = await this.calculateSubOrderShippingCost(subOrder, originCity, destinationCity)
            shippingCost[`${subOrder.shop.toString()}`] = subOrderCost.result
            shippingCost.total += subOrderCost.result
        })

        return {
            success: true,
            code: 201,
            result: shippingCost
        };

    } catch (err) {
        console.log('err.message', err.message)
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
}


exports.handleOrderData = async (orderDetailsObject, subOrder, isCod) => {
    try {
        let originCity = orderDetailsObject.shippingAddress.address.cityCode;
        let destinationCity = subOrder.address.cityCode
        let shippingCost = await this.calculateSubOrderShippingCost(subOrder, originCity, destinationCity)
        // construct order and send create request

        let orderData = {
            ...authData,
            AirwayBillData: {
                AirWayBillCreatedBy: "Sona3",
                RecipientName: orderDetailsObject.name,
                MobileNumber: orderDetailsObject.phone,
            }
        };
        const customerData = {

            AddressCountry: orderDetailsObject.shippingAddress.address.country,
            City: orderDetailsObject.shippingAddress.address.city,
            Street: orderDetailsObject.shippingAddress.address.street,
            MobileNumber2: orderDetailsObject.phone,
            Remarks: orderDetailsObject.shippingAddress.address.remarks,
            latitude: orderDetailsObject.shippingAddress.location.coordinates[0],
            longitude: orderDetailsObject.shippingAddress.location.coordinates[1],
        };



        return orderData;

    } catch (err) {
        console.log('Error processing order data:', err.message);
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
};


exports.handleServiceData = (orderDetailsObject, isReverse) => {
    try {
        console.log("handleServiceData")

        let orderData = {
            list: []
        };

        const customerData = {
            RecipientName: orderDetailsObject.name,
            MobileNumber: orderDetailsObject.phone,
            AddressCountry: orderDetailsObject.shippingAddress.address.country,
            City: orderDetailsObject.shippingAddress.address.city,
            Street: orderDetailsObject.shippingAddress.address.street,
            MobileNumber2: orderDetailsObject.phone,
            Remarks: orderDetailsObject.shippingAddress.address.remarks,
            latitude: orderDetailsObject.shippingAddress.location.coordinates[0],
            longitude: orderDetailsObject.shippingAddress.location.coordinates[1],
        };

        let subOrderData = {
            ...customerData,
            ShipperRef: orderDetailsObject.shipperRef.toString(),
            NumberOfPieces: 1,
            TotalCOG: isReverse == true ? -1 * orderDetailsObject.orderTotal : orderDetailsObject.orderTotal,
            pickup: {
                name: orderDetailsObject.shop.nameEn,
                mobileNumber: orderDetailsObject.shop.phone,
                address: `${orderDetailsObject.shop.address.country}-${orderDetailsObject.shop.address.city.name}-${orderDetailsObject.shop.address.street}`,
                latitude: orderDetailsObject.shop.location.coordinates[0],
                longitude: orderDetailsObject.shop.location.coordinates[1],
                date: new Date().toISOString()
            }
        }
        orderData.list.push(subOrderData);

        return orderData;

    } catch (err) {
        console.log('Error processing order data:', err.message);
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
};


exports.saveShipmentData = async (arrayOfTrackingObjects, orderData) => {
    try {
        console.log("Saving Shipment data")
        let resultObject
        if (orderData.service) {

            let shippingId = arrayOfTrackingObjects[0].tracking_no
            resultObject = await requestRepo.updateDirectly(orderData._id.toString(), { shippingId })

            return resultObject
        }

        if (arrayOfTrackingObjects.length != orderData.subOrders.length) return { success: false, error: i18n.__("internalServerError"), code: 500 };

        let subOrdersArray = orderData.subOrders
        let index = 0
        let shipments = []
        subOrdersArray.forEach((subOrderObject) => {
            subOrderObject.shippingId = arrayOfTrackingObjects[index].tracking_no
            shipments.push(arrayOfTrackingObjects[index].tracking_no)
            index++
        })
        resultObject = await orderRepo.updateDirectly(orderData._id.toString(), { subOrders: subOrdersArray, shipments })
        return resultObject

    } catch (err) {
        console.log('Error Saving shipment data', err.message);
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
}


exports.getOrderShipmentLastStatus = async (trackingId) => {
    try {
        const { token } = await this.getAuthToken();
        console.log("tracking data", trackingId)
        let orderData = { trackingNos: trackingId }
        console.log("Getting order last status!")
        const response = await axios.post(`${firstFlightBaseUrl}/api/order/ShipmentLastStatus`, orderData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return {
            success: true,
            code: 201,
            result: response.data.data[0],
            orderData
        };

    } catch (err) {
        console.log('Error getting status', err.message);
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
}


exports.cancelOrderShipment = async (trackingId) => {
    try {
        const { token } = await this.getAuthToken();
        console.log("tracking id", trackingId)
        console.log("Canceling Shipment!")
        const response = await axios.get(`${firstFlightBaseUrl}/api/order/DeleteShipment?trackingno=${trackingId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return {
            success: true,
            code: 201,
            result: response.data
        };

    } catch (err) {
        console.log('Error getting status', err.message);
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
}


exports.calculateSubOrderShippingCost = async (subOrder, originCity, destinationCity) => {
    try {
        let totalVolume = 0
        subOrder.items.forEach(item => {
            let itemVolume = item.variation["width"] * item.variation["height"] * item.variation["length"]
            let totalItemVolume = itemVolume * item.quantity
            totalVolume += totalItemVolume
        });

        let itemLength = Math.cbrt(totalVolume);

        let rateParameterObject = {
            ...authData,
            Origin: originCity,
            Destination: destinationCity,
            ServiceType: "NOR",
            Product: "DOX",
            Dimension: `${itemLength}X${itemLength}X${itemLength}`

        }

        const response = await axios.post(`${firstFlightBaseUrl}/RateFinder`, rateParameterObject, {
            headers: { 'Content-Type': 'application/json' }
        });

        let subOrderShippingCost = response.data.NetAmount

        return {
            success: true,
            code: 200,
            result: subOrderShippingCost
        }
    } catch (err) {
        console.log('err.message', err.message)
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
}


