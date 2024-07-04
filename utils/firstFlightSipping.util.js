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


exports.calculateOrderShippingCost = async (orderDetailsObject) => {
    try {
        console.log('calculateOrderShippingCost...');
        let originCity = orderDetailsObject.cityCode || "DXB";
        let shippingCost = { total: 0 };

        // Create an array of promises
        let subOrderPromises = orderDetailsObject.subCarts.map(async (subOrder) => {
            let destinationCity = subOrder?.address?.cityCode || "DXB";
            let subOrderCost = await this.calculateSubOrderShippingCost(subOrder, originCity, destinationCity);
            return { shop: subOrder.shop._id.toString(), cost: subOrderCost.result };
        });

        // Wait for all promises to resolve
        let subOrderCosts = await Promise.all(subOrderPromises);
        // console.log("subOrderCosts", subOrderCosts)

        // Calculate the total and individual shipping costs
        subOrderCosts.forEach(subOrderCost => {
            shippingCost[subOrderCost.shop] = subOrderCost.cost;
            shippingCost.total += subOrderCost.cost;
        });

        return {
            success: true,
            code: 201,
            result: shippingCost
        };

    } catch (err) {
        console.log('err.message', err.message);
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
};


exports.calculateSubOrderShippingCost = async (subOrder, originCity, destinationCity) => {
    try {
        let totalVolume = 0;
        console.log("calculating sub order cost")
        subOrder.items.forEach(item => {
            let itemVolume = (item.variation?.width * item.variation?.height * item.variation?.length) || 125;
            let totalItemVolume = itemVolume * item.quantity;
            totalVolume += totalItemVolume;
        });

        // console.log("sub order volume", totalVolume)
        let itemLength = parseInt(Math.cbrt(totalVolume));

        let rateParameterObject = {
            ...authData,
            Origin: originCity,
            Destination: destinationCity,
            ServiceType: "NOR",
            Product: "DOX",
            Dimension: `${itemLength}X${itemLength}X${itemLength}`
        };

        // console.log("rateParameterObject", firstFlightBaseUrl)
        const response = await axios.post(`${firstFlightBaseUrl}/RateFinder`, rateParameterObject, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log("calculateSubOrderShippingCost", response.data.NetAmount);
        let subOrderShippingCost = response.data.NetAmount;

        return {
            success: true,
            code: 200,
            result: subOrderShippingCost
        };
    } catch (err) {
        console.log('err.message', err.message);
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
};


exports.createNewBulkOrder = async (orderDetailsObject, isCod) => {
    try {
        console.log('Creating New Order...');

        const responses = [];
        for (const subOrder of orderDetailsObject.subOrders) {

            let orderData = await this.handleOrderData(orderDetailsObject, subOrder, isCod);
            console.log("orderData", orderData)
            const response = await axios.post(`${firstFlightBaseUrl}/CreateAirwayBill`, orderData, {
                headers: { 'Content-Type': 'application/json' }
            });
            responses.push(response.data);
        }

        console.log('Order created successfully:', responses);
        return {
            success: true,
            code: 201,
            result: responses,
        };

    } catch (err) {
        console.log('err.message', err.message);
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
};


exports.handleOrderData = async (orderDetailsObject, subOrder, isCod) => {
    try {
        // console.log("orderDetailsObject.shippingAddress", orderDetailsObject.shippingAddress)

        let originCity = orderDetailsObject.shippingAddress.address.cityCode || "DXB";
        let destinationCity = subOrder?.address?.cityCode || "DXB"
        let shopId = subOrder.shop?._id?.toString() || subOrder.shop
        let shippingCost = orderDetailsObject.shippingCost[`${shopId}`]
        // console.log("shippingCost", shippingCost)
        // construct order and send create request

        let customerData = {
            ReceiversCompany: orderDetailsObject.name,
            ReceiversContactPerson: orderDetailsObject.name,
            ReceiversAddress1: orderDetailsObject.shippingAddress.address.street,
            ReceiversAddress2: orderDetailsObject.shippingAddress.address.remarks,
            ReceiversCity: orderDetailsObject.shippingAddress.address.city,
            ReceiversCountry: orderDetailsObject.shippingAddress.address.country,
            ReceiversGeoLocation: `${orderDetailsObject.shippingAddress.location.coordinates[0]},${orderDetailsObject.shippingAddress.location.coordinates[1]}`,
            ReceiversPhone: "971" + orderDetailsObject.phone,
            ReceiversMobile: "971" + orderDetailsObject.phone
        }
        // console.log("customerData", customerData)

        let shopData = {
            SendersCompany: subOrder.name,
            SendersContactPerson: subOrder.name,
            SendersAddress1: `${subOrder.address.country}-${subOrder.address.city}-${subOrder.address.street}`,
            SendersAddress2: `${subOrder.address.country}-${subOrder.address.city}-${subOrder.address.street}`,
            SendersCity: subOrder.address.city,
            SendersCountry: subOrder.address.country,
            SendersGeoLocation: `${subOrder.location.coordinates[0]},${subOrder.location.coordinates[0]}`,
            SendersPhone: "971" + subOrder.phone,
            SendersMobile: "971" + subOrder.phone
        }
        // console.log("shopData", shopData)

        let productNames = ``
        productNames = subOrder.items.forEach((item) => {
            productNames += `${item?.product?.nameEn || "Product"} - `
        })
        console.log("productNames", productNames)
        let numberOfPieces = subOrder.items.reduce((accumulator, currentItem) => {
            return accumulator + currentItem.quantity;
        }, 0)

        let weight = subOrder.items.reduce((accumulator, currentItem) => {
            return accumulator + (currentItem?.variation?.weight || 0.5);
        }, 0)

        let orderData = {
            ...authData,
            AirwayBillData: {
                ...customerData,
                ...shopData,
                AirWayBillCreatedBy: "Sona3",
                CODCurrency: "AED",
                ShipmentInvoiceCurrency: "AED",
                ShipmentInvoiceValue: "0",
                DutyConsigneePay: "0",
                ProductType: "XPS",
                ServiceType: "NOR",
                CODAmount: isCod ? (subOrder.subOrderTotal + shippingCost.toString).toString() : "0",
                Origin: originCity,
                Destination: destinationCity,
                GoodsDescription: productNames || "Product Desc",
                NumberofPeices: numberOfPieces.toString(),
                Weight: weight.toString(),
            }
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





