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
            TotalCOG: "41.50",
            MobileNumber: "554545454",
            ShipperRef: "100001",
            AddressCountry: "United Arab Emirates",
            City: "Dubai",
            Area: "",
            Street: "123 Jumeirah St - JumeirahJumeirah 1 - Dubai",
            MobileNumber2: "00000221",
            Remarks: "abc",
            NumberOfPieces: "1",
            latitude: 25.165919,
            longitude: 55.241885,
            Desc1: "ORGANIC Sheep's Milk Natural Yoghurt",
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
            ShipperRef: "220000",
            AddressCountry: "United Arab Emirates",
            City: "Dubai",
            Area: "",
            Street: "152 - Dubai - United Arab Emirates 123",
            MobileNumber2: "563798893",
            Remarks: "",
            NumberOfPieces: "1",
            latitude: 25.165919,
            longitude: 55.241885,
            Desc1: "BENTLEY ORGANIC Calming & Moisturising Soap",
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


exports.createNewBulkOrder = async () => {
    try {
        // let orderData = orderData
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
            result: response.data
        };

    } catch (err) {
        console.error('err.message', err.message)
        return {
            success: false,
            error: err.message,
            code: 500
        };
    }
}