const axios = require('axios');
const i18n = require('i18n');
const orderRepo = require("../modules/Order/order.repo")
const requestRepo = require("../modules/Request/request.repo")
const { getSettings, setSettings } = require("../helpers/settings.helper")


const firstFligthBaseUrl = process.env.FIRSTFLIGHT_API_URL;
const firstFligthUsername = process.env.FIRSTFLIGHT_USER_NAME;
const firstFligthPassword = process.env.FIRSTFLIGHT_PASSWORD;
const firstFligthAccountNumber = process.env.FIRSTFLIGHT_ACCOUNT_NUMBER;
const firstFligthCountry = process.env.FIRSTFLIGHT_COUNTRY;


const authData = {
    UserName: firstFligthUsername,
    Password: firstFligthPassword,
    AccountNo: firstFligthAccountNumber,
    Country: firstFligthCountry,
}


exports.createNewBulkOrder = async (orderDetailsObject, isReverse) => {
    try {
        let orderData = { ...authData }

        if (orderDetailsObject.service) orderData = this.handleServiceData(orderDetailsObject, isReverse)
        else orderData = this.handleOrderData(orderDetailsObject, isReverse)

        console.log('Creating New Order...');

        const response = await axios.post(`${firstFligthBaseUrl}/CreateAirwayBill`, orderData, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Order created successfully:', response.data);
        return {
            success: true,
            code: 201,
            result: response.data,
            orderData
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


exports.handleOrderData = (orderDetailsObject, isCod, isReverse) => {
    try {

        let orderData = {
            ...orderDetailsObject,
            AirwayBillData: {}
        };
        const customerData = {
            AirWayBillCreatedBy: "Sona3",
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

        orderDetailsObject.subOrders.forEach(subOrder => {
            let numberOfPieces = subOrder.items.reduce((accumulator, currentItem) => {
                return accumulator + currentItem.quantity;
            }, 0)

            let subOrderData = {
                ...customerData,
                ShipperRef: subOrder._id.toString(),
                NumberOfPieces: numberOfPieces.toString(),
                CODAmount: isCod && isCod == true ? (subOrder.subOrderTotal).toString() : "0",
                CODCurrency: "AED",
                Origin: "",
                Destination: "",
                DutyConsigneePay: "0",
                pickup: {
                    name: subOrder.name,
                    mobileNumber: subOrder.phone,
                    address: `${subOrder.address.country}-${subOrder.address.city.name}-${subOrder.address.street}`,
                    latitude: subOrder.location.coordinates[0],
                    longitude: subOrder.location.coordinates[1],
                    date: new Date().toISOString()
                }
            }
            orderData.AirwayBillData = subOrderData;
        });

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
        const response = await axios.post(`${firstFligthBaseUrl}/api/order/ShipmentLastStatus`, orderData, {
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
        const response = await axios.get(`${firstFligthBaseUrl}/api/order/DeleteShipment?trackingno=${trackingId}`, {
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


exports.listCities = async (countryID) => {
    try {
        const { token } = await this.getAuthToken();
        console.log("countryID", countryID)
        const response = await axios.get(`${firstFligthBaseUrl}/api/CommonAPI/Cities?countryID=${countryID}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return {
            success: true,
            code: 201,
            result: response.data.data
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