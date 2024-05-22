const axios = require('axios');
const qs = require('qs');

const ifastBaseUrl = process.env.IFAST_API_URL;
const ifastUsername = process.env.IFAST_USER_NAME;
const ifastPassword = process.env.IFAST_PASSWORD;
const ifastAccountNumber = process.env.IFAST_ACCOUNT_NUMBER;
const grantType = "password"
let ifastToken = null;
let tokenExpiry = null;

const authData = {
    Username: ifastUsername,
    Password: ifastPassword,
    AccountNumber: ifastAccountNumber,
    grant_type: grantType,
}

let orderData = {
    list: [
        {
            RecipientName: "JT",
            TotalCOG: "41.50", // order total
            MobileNumber: "554545454",
            AddressCountry: "United Arab Emirates",
            City: "Dubai",
            Street: "123 Jumeirah St - JumeirahJumeirah 1 - Dubai",
            MobileNumber2: "554545454",
            Remarks: "abc",
            NumberOfPieces: "1",
            latitude: 25.165919,
            longitude: 55.241885,
            pickup: {
                name: "test",
                mobileNumber: "563798893",
                address: "test123",
                latitude: 25.165919,
                longitude: 55.241885,
                date: "2024-05-20T10:29:05.592Z"
            }
        },
        {
            RecipientName: "JT test",
            TotalCOG: "11.50",
            MobileNumber: "563798893",
            AddressCountry: "United Arab Emirates",
            City: "Dubai",
            Street: "152 - Dubai - United Arab Emirates 123",
            MobileNumber2: "563798893",
            Remarks: "",
            NumberOfPieces: "1",
            latitude: 25.165919,
            longitude: 55.241885,
            pickup: {
                name: "test",
                mobileNumber: "563798893",
                address: "test123",
                latitude: 25.165919,
                longitude: 55.241885,
                date: "2024-05-20T10:29:05.592Z"
            }
        }
    ]
}

exports.getAuthToken = async () => {
    try {

        if (!ifastToken || !tokenExpiry || Date.now() >= tokenExpiry) {
            console.log("Ifast Token Expired or Not Found!")
            result = await this.acquireTokenFromIfast(authData);
            ifastToken = result.token
        }

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

        ifastToken = response.data.access_token;
        tokenExpiry = Date.now() + response.data.expires_in * 1000;
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


exports.createNewBulkOrder = async (orderDetailsObject) => {
    try {
        // console.log("customerOrderObject", orderDetailsObject);
        // let orderData = this.handleOrderData(orderDetailsObject)
        // const { token } = await this.getAuthToken();
        // console.log('Creating New Order...');

        // const response = await axios.post(`${ifastBaseUrl}/api/order/placeorderbulkwithpickup`, orderData, {
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${token}`
        //     }
        // });

        // console.log('Order created successfully:', response.data);
        return {
            success: true,
            code: 201,
            // result: response.data
            result: orderDetailsObject
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


exports.handleOrderData = (orderDetailsObject) => {
    try {

        let orderData = {
            list: []
        };


        const totalCOG = orderDetailsObject.subOrders.reduce((total, subOrder) => total + subOrder.subOrderTotal, 0).toFixed(2);
        const numberOfPieces = orderDetailsObject.subOrders.reduce((total, subOrder) => total + subOrder.items.reduce((subTotal, item) => subTotal + item.quantity, 0), 0);
        
        const pickupName = "test"; // Assuming static value for pickup name
        const pickupMobileNumber = "563798893"; // Assuming static value for pickup mobile number
        const pickupAddress = "test123"; // Assuming static value for pickup address
        const pickupLatitude = 25.165919; // Assuming static value for pickup latitude
        const pickupLongitude = 55.241885; // Assuming static value for pickup longitude

        // Constructing the order object
        const order = {
            RecipientName: orderDetailsObject.name,
            TotalCOG: totalCOG, /////////////////
            MobileNumber: orderDetailsObject.phone,
            AddressCountry: orderDetailsObject.shippingAddress.address.country,
            City: orderDetailsObject.shippingAddress.address.city,
            Street: orderDetailsObject.shippingAddress.address.street,
            MobileNumber2: orderDetailsObject.phone,
            Remarks: orderDetailsObject.shippingAddress.address.remarks,
            NumberOfPieces: numberOfPieces.toString(),
            latitude: orderDetailsObject.shippingAddress.location.coordinates[0],
            longitude: orderDetailsObject.shippingAddress.location.coordinates[1],
            pickup: {
                name: pickupName,
                mobileNumber: pickupMobileNumber,
                address: pickupAddress,
                latitude: pickupLatitude,
                longitude: pickupLongitude,
                date: new Date().toISOString()
            }
        };

        // Adding the constructed order to the list
        orderData.list.push(order);

        // Return the formatted order data
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
