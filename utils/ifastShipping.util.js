const axios = require('axios');
const qs = require('qs');
const i18n = require('i18n');
const orderRepo = require("../modules/Order/order.repo")
const requestRepo = require("../modules/Request/request.repo")
const { getSettings, setSettings } = require("../helpers/settings.helper")
const { processPDFContent } = require("../helpers/convertToFile.helper")
const s3StorageHelper = require("./s3FileStorage.util")

const ifastBaseUrl = process.env.IFAST_API_URL;
const ifastUsername = process.env.IFAST_USER_NAME;
const ifastPassword = process.env.IFAST_PASSWORD;
const ifastAccountNumber = process.env.IFAST_ACCOUNT_NUMBER;
const grantType = "password"


const authData = {
    Username: ifastUsername,
    Password: ifastPassword,
    AccountNumber: ifastAccountNumber,
    grant_type: grantType,
}


exports.getAuthToken = async () => {
    try {
        let ifastToken = getSettings("ifastToken") || null;
        let tokenExpiry = getSettings("tokenExpiry") || null;

        if (!ifastToken || !tokenExpiry || Date.now() >= tokenExpiry) {
            console.log("Ifast Token Expired or Not Found!")
            result = await this.acquireTokenFromIfast(authData);
            ifastToken = result.token
        } else console.log("Ifast Token is Found and Valid!")

        return {
            success: true,
            token: ifastToken,
            code: 200
        };

    } catch (err) {
        console.error('err.message', err.message)
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
};


exports.acquireTokenFromIfast = async (authDataObject) => {
    try {
        const response = await axios.post(`${ifastBaseUrl}/GetAuthToken`, qs.stringify(authDataObject), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        let ifastToken = response.data.access_token;
        let tokenExpiry = Date.now() + response.data.expires_in * 1000;
        let newSettings = setSettings({ ifastToken, tokenExpiry })

        console.log('New Token Acquired from Ifast');
        return {
            success: true,
            code: 200,
            token: ifastToken,
            tokenExpiry
        };

    } catch (err) {
        console.error('err.message', err.message)
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
};


exports.createNewBulkOrder = async (orderDetailsObject, isReverse) => {
    try {
        let orderData

        if (orderDetailsObject.service) orderData = this.handleServiceData(orderDetailsObject, isReverse)
        else orderData = this.handleOrderData(orderDetailsObject, isReverse)
        const { token } = await this.getAuthToken();
        console.log('Creating New Order...');
    
        const response = await axios.post(`${ifastBaseUrl}/api/order/placeorderbulkwithpickup`, orderData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
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


exports.handleOrderData = (orderDetailsObject, isReverse) => {
    try {
        let isCod = true
        if (orderDetailsObject.paymentMethod == "visa") isCod = false
        let orderData = {
            list: []
        };
        const customerData = {
            RecipientName: orderDetailsObject.name,
            MobileNumber: orderDetailsObject.phone.length > 9 ? orderDetailsObject.phone.substring(3) : orderDetailsObject.phone,
            AddressCountry: orderDetailsObject.shippingAddress.address.country,
            City: orderDetailsObject.shippingAddress.address.city,
            Street: orderDetailsObject.shippingAddress.address.street,
            MobileNumber2: orderDetailsObject.phone.length > 9 ? orderDetailsObject.phone.substring(3) : orderDetailsObject.phone,
            Remarks: orderDetailsObject.shippingAddress.address.remarks,
            latitude: orderDetailsObject.shippingAddress.location.coordinates[0] || 25.165919,
            longitude: orderDetailsObject.shippingAddress.location.coordinates[1] || 55.241885,
        };

        orderDetailsObject.subOrders.forEach(subOrder => {
            let numberOfPieces = subOrder.items.reduce((accumulator, currentItem) => {
                return accumulator + currentItem.quantity;
            }, 0)

            let subOrderData = {
                ...customerData,
                ShipperRef: subOrder._id.toString(),
                NumberOfPieces: numberOfPieces,
                TotalCOG: isReverse == true ? -1 * subOrder.subOrderTotal : (isCod ? subOrder.subOrderTotal : 0),
                pickup: {
                    name: subOrder.name,
                    mobileNumber: subOrder.phone.length > 9 ? subOrder.phone.substring(3) : subOrder.phone,
                    address: `${subOrder.address.country}-${subOrder.address.city.name}-${subOrder.address.street}`,
                    latitude: subOrder.location.coordinates[0] || 25.165919,
                    longitude: subOrder.location.coordinates[1] || 55.241885,
                    date: new Date().toISOString()
                }
            }
            orderData.list.push(subOrderData);
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
        let isCod = true
        if (orderDetailsObject.paymentMethod == "visa") isCod = false

        let orderData = {
            list: []
        };

        const customerData = {
            RecipientName: orderDetailsObject.name,
            MobileNumber: orderDetailsObject.phone.length > 9 ? orderDetailsObject.phone.substring(3) : orderDetailsObject.phone,
            AddressCountry: orderDetailsObject.shippingAddress.address.country,
            City: orderDetailsObject.shippingAddress.address.city,
            Street: orderDetailsObject.shippingAddress.address.street,
            MobileNumber2: orderDetailsObject.phone.length > 9 ? orderDetailsObject.phone.substring(3) : orderDetailsObject.phone,
            Remarks: orderDetailsObject.shippingAddress.address.remarks,
            latitude: orderDetailsObject.shippingAddress.location.coordinates[0] || 25.165919,
            longitude: orderDetailsObject.shippingAddress.location.coordinates[1] || 55.241885,
        };

        let subOrderData = {
            ...customerData,
            ShipperRef: orderDetailsObject.shipperRef.toString(),
            NumberOfPieces: 1,
            TotalCOG: isReverse == true ? -1 * orderDetailsObject.orderTotal : (isCod ? orderDetailsObject.orderTotal : 0),
            pickup: {
                name: orderDetailsObject.shop.nameEn,
                mobileNumber: orderDetailsObject.shop.phone.length > 9 ? orderDetailsObject.shop.phone.substring(3) : orderDetailsObject.shop.phone,
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
        const response = await axios.post(`${ifastBaseUrl}/api/order/ShipmentLastStatus`, orderData, {
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
        const response = await axios.get(`${ifastBaseUrl}/api/order/DeleteShipment?trackingno=${trackingId}`, {
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
        const response = await axios.get(`${ifastBaseUrl}/api/CommonAPI/Cities?countryID=${countryID}`, {
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


exports.generateOrderLabel = async (airwayBillNumber) => {
    try {
        const { token } = await this.getAuthToken();
        console.log('Generating Label...');
    
        const response = await axios.get(`${ifastBaseUrl}/api/order/GetAirWayBill?TrackingNos=${airwayBillNumber}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            responseType: 'arraybuffer'  // This is important for binary data
        });

        console.log("Response received. Data type:", typeof response.data);
        console.log("Response data length:", response.data.length);

        // Convert arraybuffer to string
        const pdfContent = Buffer.from(response.data).toString('binary');
    
        let generatedPDF = await processPDFContent(pdfContent);
        
        if (!generatedPDF.success) {
            console.log("PDF processing failed:", generatedPDF.error);
            return generatedPDF;
        }

        let uploadedFile = await s3StorageHelper.uploadPDFtoS3(generatedPDF.result);
    
        if (!uploadedFile.success) {
            console.log("S3 upload failed:", uploadedFile.error);
            return uploadedFile;
        }

        return {
            success: true,
            code: 201,
            result: uploadedFile.result
        }

    } catch(err) {
        console.log('Error in generateOrderLabel:', err.message);
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
}