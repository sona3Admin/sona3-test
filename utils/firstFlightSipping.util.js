const axios = require('axios');
const i18n = require('i18n');
const orderRepo = require("../modules/Order/order.repo")
const requestRepo = require("../modules/Request/request.repo")
const { findObjectInArray } = require("../helpers/cart.helper")
const { convertBase64StringToPDF } = require("../helpers/convertToFile.helper")
const s3StorageHelper = require("./s3FileStorage.util")
const { v4: uuid } = require('uuid');


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
        let originCity = orderDetailsObject.CityCode || "DXB";
        let shippingCost = { total: 0 };
        // console.log("orderDetailsObject.CityCode", orderDetailsObject.CityCode)
        // console.log("originCity", originCity)
        // Create an array of promises
        let subOrderPromises = orderDetailsObject.subCarts.map(async (subOrder) => {
            let destinationCity = subOrder?.address?.city.CityCode || "DXB";
            // console.log("subOrder?.address", subOrder?.address)
            // console.log("subOrder?.address?.CityCode", subOrder?.address?.city.CityCode)
            // console.log("destinationCity", destinationCity)

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
        // console.log("shippingCost", shippingCost)
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


exports.calculateServiceShippingCost = async (orderDetailsObject) => {
    try {
        console.log('calculateServiceShippingCost...');
        let originCity = orderDetailsObject.cityCode || "DXB";
        let shippingCost = { total: 0 };
        let destinationCity = orderDetailsObject?.shop?.address?.cityCode || "DXB";
        let itemVolume = (orderDetailsObject.service?.width * orderDetailsObject.service?.height * orderDetailsObject.service?.length) || 125

        let itemLength = parseInt(Math.cbrt(itemVolume));

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

        shippingCost.total = response.data.NetAmount;

        return {
            success: true,
            code: 200,
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
}


exports.createNewBulkOrder = async (orderDetailsObject, isReverse) => {
    try {
        console.log('Creating New Order...');
        let isCod = true
        if (orderDetailsObject.paymentMethod == "visa") isCod = false
        let airwayBillNumbers = []
        let pickupRequestNumbers = []
        for (const subOrder of orderDetailsObject.subOrders) {

            let airwayBillInfo = await this.handleOrderData(orderDetailsObject, subOrder, isCod, isReverse);
            console.log("airwayBillInfo", airwayBillInfo)
            let response = await axios.post(`${firstFlightBaseUrl}/CreateAirwayBill`, airwayBillInfo.orderData, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log("response.data", response.data)

            response.data.CODAmount = airwayBillInfo.orderData.AirwayBillData.CODAmount
            airwayBillNumbers.push(response.data.AirwayBillNumber);

            let pickupNumber = await this.createNewPickupRequest(airwayBillInfo)
            pickupRequestNumbers.push(pickupNumber.result)
        }

        console.log('Order created successfully', airwayBillNumbers);
        return {
            success: true,
            code: 201,
            result: airwayBillNumbers,
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


exports.createNewPickupRequest = async (orderDetailsObject) => {
    try {
        console.log("Creating New Pickup Request")
        let pickupRequestData = {
            ...authData,
            BookingData: {
                BookingAddress1: "COMPANY ADDRESS",
                BookingAddress2: "COMPANY ADDRESS",
                BookingCompanyName: "Sona3",
                BookingContactPerson: "Mr Rashid",
                BookingCreatedBy: "Sona3",
                BookingCity: "DXB",
                BookingCountry: "AE",
                BookingEmail: "sona3@gmail.com",
                BookingMobileNo: "0501111111",
                BookingPhoneNo: "042222222",
                ...orderDetailsObject.customerData,
                ...orderDetailsObject.shopData,
                Origin: orderDetailsObject.orderData.AirwayBillData.Origin,
                Destination: orderDetailsObject.orderData.AirwayBillData.Destination,
                ProductType: orderDetailsObject.orderData.AirwayBillData.ProductType,
                ServiceType: orderDetailsObject.orderData.AirwayBillData.ServiceType,
                GoodsDescription: orderDetailsObject.orderData.AirwayBillData.GoodsDescription,
                NumberofPeices: parseInt(orderDetailsObject.orderData.AirwayBillData.NumberofPeices),
                AppoximateWeight: parseInt(orderDetailsObject.orderData.AirwayBillData.Weight),
                NumberofShipments: 1,
                CODAmount: orderDetailsObject.orderData.AirwayBillData.CODAmount
            }
        }
        let response = await axios.post(`${firstFlightBaseUrl}/SchedulePickup`, pickupRequestData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return {
            success: true,
            code: 201,
            result: response.data.PickupRequestNo,
        };

    } catch (err) {
        console.log('err.message', err.message);
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
}


exports.handleOrderData = async (orderDetailsObject, subOrder, isCod, isReverse) => {
    try {
        if (isReverse == true) return await this.handleReverseOrderData(orderDetailsObject, subOrder, isCod)
        let originCity = orderDetailsObject.shippingAddress.address.city.CityCode || "DXB";
        let destinationCity = subOrder?.address?.city.CityCode || "DXB"
        let shopId = subOrder.shop?._id?.toString() || subOrder.shop
        let shippingCost = orderDetailsObject.shippingCost[`${shopId}`]

        let customerData = {
            ReceiversCompany: orderDetailsObject.name,
            ReceiversContactPerson: orderDetailsObject.name,
            ReceiversAddress1: orderDetailsObject.shippingAddress.address.street,
            ReceiversAddress2: orderDetailsObject.shippingAddress.address.remarks,
            ReceiversCity: orderDetailsObject.shippingAddress.address.city.CityName,
            ReceiversCountry: orderDetailsObject.shippingAddress.address.country,
            ReceiversGeoLocation: `${orderDetailsObject.shippingAddress.location.coordinates[0] || 25.165919},${orderDetailsObject.shippingAddress.location.coordinates[1] || 55.241885}`,
            ReceiversPhone: orderDetailsObject.phone.length == 9 ? `971${orderDetailsObject.phone}` : "971554535454",
            ReceiversMobile: orderDetailsObject.phone.length == 9 ? `971${orderDetailsObject.phone}` : "971554535454"
        }


        let shopData = {
            SendersCompany: subOrder.name,
            SendersContactPerson: subOrder.name,
            SendersAddress1: `${subOrder.address.country}-${subOrder.address.city.CityName}-${subOrder.address.street}`,
            SendersAddress2: `${subOrder.address.country}-${subOrder.address.city.CityName}-${subOrder.address.street}`,
            SendersCity: subOrder.address.city.CityName,
            SendersCountry: subOrder.address.country,
            SendersGeoLocation: `${subOrder.location.coordinates[0] || 25.165919},${subOrder.location.coordinates[1] || 55.241885}`,
            SendersPhone: subOrder.phone.length == 9 ? `971${subOrder.phone}` : "971554535454",
            SendersMobile: subOrder.phone.length == 9 ? `971${subOrder.phone}` : "971554535454"
        }


        let productNames = ``
        productNames = subOrder.items.forEach((item) => {
            productNames += `${item?.product?.nameEn || "Product - "} `
        })

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
                CODAmount: isCod ? (subOrder.subOrderTotal + shippingCost).toString() : "0",
                Origin: originCity,
                Destination: destinationCity,
                GoodsDescription: productNames || "Product Desc",
                NumberofPeices: numberOfPieces.toString(),
                Weight: weight.toString(),
            }
        };

        return { orderData, customerData, shopData };

    } catch (err) {
        console.log('Error processing order data:', err.message);
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
};


exports.handleReverseOrderData = async (orderDetailsObject, subOrder, isCod) => {
    try {
        // console.log("orderDetailsObject.shippingAddress", orderDetailsObject.shippingAddress)
        console.log("Creating Resverse Order")
        let originCity = subOrder?.address?.city.CityCode || "DXB";
        let destinationCity = orderDetailsObject.shippingAddress.address.city.CityCode || "DXB"
        let shopId = subOrder.shop?._id?.toString() || subOrder.shop
        console.log("shopId", shopId)
        let shippingCost = await this.calculateSubOrderShippingCost(subOrder, originCity, destinationCity)
        console.log("shippingCost", shippingCost)

        let customerData = {
            SendersCompany: orderDetailsObject.name,
            SendersContactPerson: orderDetailsObject.name,
            SendersAddress1: orderDetailsObject.shippingAddress.address.street,
            SendersAddress2: orderDetailsObject.shippingAddress.address.remarks,
            SendersCity: orderDetailsObject.shippingAddress.address.city.CityName,
            SendersCountry: orderDetailsObject.shippingAddress.address.country,
            SendersGeoLocation: `${orderDetailsObject.shippingAddress.location.coordinates[0] || 25.165919},${orderDetailsObject.shippingAddress.location.coordinates[1] || 55.241885}`,
            SendersPhone: orderDetailsObject.phone.length == 9 ? `971${orderDetailsObject.phone}` : "971554535454",
            SendersMobile: orderDetailsObject.phone.length == 9 ? `971${orderDetailsObject.phone}` : "971554535454"
        }

        let shopData = {
            ReceiversCompany: subOrder.name,
            ReceiversContactPerson: subOrder.name,
            ReceiversAddress1: `${subOrder.address.country}-${subOrder.address.city.CityName}-${subOrder.address.street}`,
            ReceiversAddress2: `${subOrder.address.country}-${subOrder.address.city.CityName}-${subOrder.address.street}`,
            ReceiversCity: subOrder.address.city.CityName,
            ReceiversCountry: subOrder.address.country,
            ReceiversGeoLocation: `${subOrder.location.coordinates[0] || 25.165919},${subOrder.location.coordinates[1] || 55.241885}`,
            ReceiversPhone: subOrder.phone.length == 9 ? `971${subOrder.phone}` : "971554535454",
            ReceiversMobile: subOrder.phone.length == 9 ? `971${subOrder.phone}` : "971554535454"
        }
        console.log("971${subOrder.phone}", `971${subOrder.phone}`)

        let productNames = ``
        productNames = subOrder.items.forEach((item) => {
            productNames += `${item?.product?.nameEn || "Product - "} `
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
                CODAmount: isCod ? (subOrder.subOrderTotal + shippingCost.result).toString() : "0",
                Origin: originCity,
                Destination: destinationCity,
                GoodsDescription: productNames || "Product Desc",
                NumberofPeices: numberOfPieces.toString(),
                Weight: weight.toString(),
            }
        };

        return { orderData, customerData, shopData };

    } catch (err) {
        console.log('Error processing order data:', err.message);
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
}


exports.createServiceOrder = async (orderDetailsObject, isReverse) => {
    try {
        console.log('Creating New Service Order...');
        if (isReverse == true) return await this.handleReverseServiceData(orderDetailsObject)
        let isCod = true
        if (orderDetailsObject.paymentMethod == "visa") isCod = false

        let originCity = orderDetailsObject.shippingAddress.address.cityCode || "DXB";
        let destinationCity = orderDetailsObject?.shop?.address?.cityCode || "DXB"
        let shopId = orderDetailsObject?.shop?._id?.toString()
        console.log("shopId", shopId)
        let shippingCost = orderDetailsObject.shippingFeesTotal
        console.log("shippingCost", shippingCost)

        let customerData = {
            ReceiversCompany: orderDetailsObject.name,
            ReceiversContactPerson: orderDetailsObject.name,
            ReceiversAddress1: orderDetailsObject.shippingAddress.address.street,
            ReceiversAddress2: orderDetailsObject.shippingAddress.address.remarks,
            ReceiversCity: orderDetailsObject.shippingAddress.address.city,
            ReceiversCountry: orderDetailsObject.shippingAddress.address.country,
            ReceiversGeoLocation: `${orderDetailsObject.shippingAddress.location.coordinates[0] || 25.165919},${orderDetailsObject.shippingAddress.location.coordinates[1] || 55.241885}`,
            ReceiversPhone: orderDetailsObject.phone.length == 9 ? `971${orderDetailsObject.phone}` : "971554535454",
            ReceiversMobile: orderDetailsObject.phone.length == 9 ? `971${orderDetailsObject.phone}` : "971554535454"
        }

        let shopData = {
            SendersCompany: orderDetailsObject.shop.nameEn,
            SendersContactPerson: orderDetailsObject.shop.nameEn,
            SendersAddress1: `${orderDetailsObject.shop.address.country}-${orderDetailsObject.shop.address.city}-${orderDetailsObject.shop.address.street}`,
            SendersAddress2: `${orderDetailsObject.shop.address.country}-${orderDetailsObject.shop.address.city}-${orderDetailsObject.shop.address.street}`,
            SendersCity: orderDetailsObject.shop.address.city,
            SendersCountry: orderDetailsObject.shop.address.country,
            SendersGeoLocation: `${orderDetailsObject.shop.location.coordinates[0] || 25.165919},${orderDetailsObject.shop.location.coordinates[1] || 55.241885}`,
            SendersPhone: orderDetailsObject.shop.phone.length == 9 ? `971${orderDetailsObject.shop.phone}` : "971554535454",
            SendersMobile: orderDetailsObject.shop.phone.length == 9 ? `971${orderDetailsObject.shop.phone}` : "971554535454"
        }

        let productName = orderDetailsObject.service.nameEn
        console.log("productName", productName)
        let numberOfPieces = 1
        let weight = orderDetailsObject.service.weight || "5"
        console.log("weight", weight)


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
                CODAmount: isCod ? (orderDetailsObject.orderTotal + shippingCost).toString() : "0",
                Origin: originCity,
                Destination: destinationCity,
                GoodsDescription: productName || "Product Desc",
                NumberofPeices: numberOfPieces.toString(),
                Weight: weight.toString(),
            }
        };


        const response = await axios.post(`${firstFlightBaseUrl}/CreateAirwayBill`, orderData, {
            headers: { 'Content-Type': 'application/json' }
        });

        response.data.CODAmount = orderData.AirwayBillData.CODAmount
        console.log('Order created successfully:', response.data);
        return {
            success: true,
            code: 201,
            result: response.data,
        };

    } catch (err) {
        console.log('Error processing order data:', err.message);
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
};


exports.handleReverseServiceData = async (orderDetailsObject) => {
    try {
        console.log('Creating New Reverse Service Order...');
        let isCod = true
        if (orderDetailsObject.paymentMethod == "visa") isCod = false

        let originCity = orderDetailsObject?.shop?.address?.cityCode || "DXB"
        let destinationCity = orderDetailsObject.shippingAddress.address.cityCode || "DXB";
        let shopId = orderDetailsObject?.shop?._id?.toString()
        console.log("shopId", shopId)
        let shippingCost = orderDetailsObject.shippingFeesTotal
        console.log("shippingCost", shippingCost)

        let customerData = {
            SendersCompany: orderDetailsObject.name,
            SendersContactPerson: orderDetailsObject.name,
            SendersAddress1: orderDetailsObject.shippingAddress.address.street,
            SendersAddress2: orderDetailsObject.shippingAddress.address.remarks,
            SendersCity: orderDetailsObject.shippingAddress.address.city,
            SendersCountry: orderDetailsObject.shippingAddress.address.country,
            SendersGeoLocation: `${orderDetailsObject.shippingAddress.location.coordinates[0] || 25.165919},${orderDetailsObject.shippingAddress.location.coordinates[1] || 55.241885}`,
            SendersPhone: orderDetailsObject.phone.length == 9 ? `971${orderDetailsObject.phone}` : "971554535454",
            SendersMobile: orderDetailsObject.phone.length == 9 ? `971${orderDetailsObject.phone}` : "971554535454"
        }

        let shopData = {
            ReceiversCompany: orderDetailsObject.shop.nameEn,
            ReceiversContactPerson: orderDetailsObject.shop.nameEn,
            ReceiversAddress1: `${orderDetailsObject.shop.address.country}-${orderDetailsObject.shop.address.city}-${orderDetailsObject.shop.address.street}`,
            ReceiversAddress2: `${orderDetailsObject.shop.address.country}-${orderDetailsObject.shop.address.city}-${orderDetailsObject.shop.address.street}`,
            ReceiversCity: orderDetailsObject.shop.address.city,
            ReceiversCountry: orderDetailsObject.shop.address.country,
            ReceiversGeoLocation: `${orderDetailsObject.shop.location.coordinates[0] || 25.165919},${orderDetailsObject.shop.location.coordinates[1] || 55.241885}`,
            ReceiversPhone: orderDetailsObject.shop.phone.length == 9 ? `971${orderDetailsObject.shop.phone}` : "971554535454",
            ReceiversMobile: orderDetailsObject.shop.phone.length == 9 ? `971${orderDetailsObject.shop.phone}` : "971554535454"
        }

        let productName = orderDetailsObject.service.nameEn
        console.log("productName", productName)
        let numberOfPieces = 1
        let weight = orderDetailsObject.service.weight || "5"
        console.log("weight", weight)


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
                CODAmount: isCod ? (orderDetailsObject.orderTotal + shippingCost).toString() : "0",
                Origin: originCity,
                Destination: destinationCity,
                GoodsDescription: productName || "Product Desc",
                NumberofPeices: numberOfPieces.toString(),
                Weight: weight.toString(),
            }
        };


        const response = await axios.post(`${firstFlightBaseUrl}/CreateAirwayBill`, orderData, {
            headers: { 'Content-Type': 'application/json' }
        });
        response.data.CODAmount = orderData.AirwayBillData.CODAmount

        console.log('Reverse Order created successfully:', response.data);
        return {
            success: true,
            code: 201,
            result: response.data,
        };

    } catch (err) {
        console.log('Error processing order data:', err.message);
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
}


exports.saveShipmentData = async (arrayOfTrackingObjects, orderData, shippingCost) => {
    try {
        console.log("Saving Shipment data", arrayOfTrackingObjects)
        let resultObject
        let shippingFeesTotal = 0
        console.log("shippingCost", shippingCost)
        
        if (shippingCost?.total != undefined) shippingFeesTotal = parseFloat(shippingCost?.total)
        else shippingFeesTotal = parseFloat(shippingCost)
       
        if (arrayOfTrackingObjects.length != orderData.subOrders.length) return { success: false, error: i18n.__("internalServerError"), code: 500 };

        let subOrdersArray = orderData.subOrders
        let index = 0
        let shipments = []
        if (shippingCost?.total) delete shippingCost["total"]

        subOrdersArray.forEach((subOrderObject) => {
            subOrderObject.shippingId = arrayOfTrackingObjects[index]
            subOrderObject.shopShippingFees = shippingCost[`${subOrderObject?.shop}`] ? parseFloat(shippingCost[`${subOrderObject.shop}`]) : shippingCost
            subOrderObject.subOrderTotal += parseFloat(subOrderObject.shopShippingFees)
            shipments.push(arrayOfTrackingObjects[index])
            index++
        })
        const updatedOrderQuery = {
            subOrders: subOrdersArray, shipments, shippingFeesTotal
        }
        if (shippingFeesTotal > 0) updatedOrderQuery.$inc = { orderTotal: shippingFeesTotal }
        resultObject = await orderRepo.updateDirectly(orderData._id.toString(), updatedOrderQuery)
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
        console.log("tracking data", trackingId)
        let orderData = { TrackingAWB: trackingId, ...authData }
        console.log("Getting order last status!")
        const response = await axios.post(`${firstFlightBaseUrl}/Tracking`, orderData, {
            headers: { 'Content-Type': 'application/json' }
        });
        // this.updateOrderShipmentStatus(trackingId, latestStatus)
        return {
            success: true,
            code: 201,
            result: response.data.AirwayBillTrackList,
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


exports.listCities = async () => {
    try {

        const response = await axios.post(`https://customerapp.firstflightme.com/FirstFlightService.svc/CityList`, authData, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log("response", response);
        console.log('process.env.FIRSTFLIGHT_ACCOUNT_NUMBER', process.env.FIRSTFLIGHT_ACCOUNT_NUMBER)
        console.log('process.env.FIRSTFLIGHT_API_URL', process.env.FIRSTFLIGHT_API_URL)
        console.log('process.env.FIRSTFLIGHT_USER_NAME', process.env.FIRSTFLIGHT_COUNTRY)
        console.log('process.env.FIRSTFLIGHT_PASSWORD', process.env.FIRSTFLIGHT_PASSWORD)
        
        return {
            success: true,
            code: 201,
            result: response.data.CityListLocation
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


exports.updateOrderShipmentStatus = async (trackingId, latestStatus) => {
    try {
        let status = latestStatus

        let orderObject = await orderRepo.find({ shipments: trackingId })
        if (!orderObject.success) {
            let requestObject = await requestRepo.find({ shippingId: trackingId })
            status = handleStatus(status, "request") || requestObject.result.status
            console.log("request status", status)

            requestRepo.updateDirectly(requestObject.result._id.toString(), { shippingStatus: status, status })
            return {
                success: true,
                code: 200
            }
        }

        let subOrderObject = findObjectInArray(orderObject.result.subOrders, "shippingId", trackingId)
        if (!subOrderObject.success) return { success: false, code: 404 }

        let subOrders
        orderObject.result.subOrders[subOrderObject.index].shippingStatus = status
        orderObject.result.subOrders[subOrderObject.index].status = handleStatus(status, "order") || subOrderObject.result.status
        console.log("order status", orderObject.result.subOrders[subOrderObject.index].status)
        orderRepo.updateDirectly(orderObject.result._id.toString(), { subOrders })
        return {
            success: true,
            code: 200
        }

    } catch (err) {
        console.log(`err.message controller`, err.message);
        return {
            success: false,
            error: err.message,
            code: 500,
            status: false
        }
    }
}


function handleStatus(firstFlightStausText, orderType) {
    let status = undefined
    if (firstFlightStausText == "Order Placed" && orderType == "order") status = "pending"
    if (firstFlightStausText == "Order Placed" && orderType == "request") status = "purchased"
    if (firstFlightStausText == "Delivered") status = "delivered"
    if (firstFlightStausText == "Cancelled") status = "canceled"
    if (firstFlightStausText == "Returned to Origin") status = "returned"
    if (firstFlightStausText == "To be Picked Up" || firstFlightStausText == "Out For Delivery") status = "in progress"
    if (firstFlightStausText == "Return Attempt" || firstFlightStausText == "Return to Origin") status = "to be returned"
    return status
}


exports.generateOrderLabel = async (airwayBillNumber, printType, requestUser) => {
    try {
        let airwayBillData = {
            ...authData,
            AirwayBillNumber: airwayBillNumber,
            PrintType: printType,
            RequestUser: requestUser
        }

        let response = await axios.post(`${firstFlightBaseUrl}/AirwaybillPDFFormat`, airwayBillData, {
            headers: { 'Content-Type': 'application/json' }
        });

        let generatedPDF = await convertBase64StringToPDF(response.data.ReportDoc);        
        let uploadedFile = await s3StorageHelper.uploadPDFtoS3(`pdf-${uuid()}`, [
            {
                buffer: Buffer.from(generatedPDF.result),
                mimetype: 'application/pdf'
            }
        ]);        

        return {
            success: true,
            code: 201,
            result: uploadedFile.result
        }

    } catch (err) {
        console.log('Error ', err.message);
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
}