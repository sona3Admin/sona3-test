const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database")
const { generateDummyDataFromSchema } = require("../../helpers/randomData.helper")
let baseUrl = '/api/v1/seller';
let token;

let requestHeaders = {
    'x-app-token': 'Sona3-Team',
    'accept-language': 'en',
    "Authorization": `Bearer ${token}`
};

let createdRecordObject;
let schema = {
    userName: 'string',
    email: 'email',
    password: '123',
    phone: 'phone',
    address: 'string',
};

describe('=====>Testing Seller Auth Module Endpoints <=====', () => {

    beforeEach(() => {
        mongoDB.connect();
    });


    it('should register a new seller | endpoint => /api/v1/seller/register', async () => {
        const sellerData = generateDummyDataFromSchema(schema)
        const response = await request(app)
            .post(`${baseUrl}/register`)
            .set(requestHeaders)
            .send(sellerData);

        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

    });


    it('should return an error for duplicate emails | endpoint => /api/v1/seller/register', async () => {
        const response = await request(app)
            .post(`${baseUrl}/register`)
            .set(requestHeaders)
            .send({ userName: "seller", email: createdRecordObject.email, password: "123" });

        expect(response.status).toBe(409);
    });


    it('should return an error for missing headers endpoint => /api/v1/seller/login', async () => {
        const sellerCredentials = { email: createdRecordObject.email, password: "123" }

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .send(sellerCredentials)

        expect(response.status).toBe(500); // Unauthorized status code
    });


    it('should authenticate an seller and return a token endpoint => /api/v1/seller/login', async () => {
        const sellerCredentials = { email: createdRecordObject.email, password: "123" }
        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(sellerCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        token = response.body.token
    });


    it('should return an error for non-existent email endpoint => /api/v1/seller/login', async () => {
        const sellerCredentials = { email: 'notfound@email.com', password: 'anypassword' };

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(sellerCredentials);

        expect(response.status).toBe(404); // Assuming 404 is used for not found
        expect(response.body).toHaveProperty('success', false);
    });


    it('should return an error for incorrect password endpoint => /api/v1/seller/login', async () => {
        const sellerCredentials = { email: createdRecordObject.email, password: "incorrectPassword" }

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(sellerCredentials);

        expect(response.status).toBe(409); // Assuming 404 is used for not found
        expect(response.body).toHaveProperty('success', false);
    });


    it('should return an error for missing email or password endpoint => /api/v1/seller/login', async () => {

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
    });


    it('should return a valid token in the response endpoint => /api/v1/seller/login', async () => {
        const sellerCredentials = { email: createdRecordObject.email, password: "123" }
        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(sellerCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');

    });


    // it('should return an error if seller is not active => /api/v1/seller/login', async () => {
    //     const sellerCredentials = { email: createdRecordObject.email, password: "123" }
    //     console.log(`createdRecordObject._id`, createdRecordObject._id);
    //     const update = await request(app)
    //         .put(`${baseUrl}/update?_id=${createdRecordObject._id}`)
    //         .set(requestHeaders)
    //         .send({ isActive: false });

    //     console.log("update", update.body)
    //     console.log(`token`, token);
    //    requestHeaders["Authorization"] = `Bearer ${token}`;
    //    console.log(`requestHeaders`, requestHeaders.Authorization);
    //     const response = await request(app)
    //         .post(`${baseUrl}/login`)
    //         .set(requestHeaders)
    //         .send(sellerCredentials);

    //     expect(response.status).toBe(401);

    // });


    // it('should return an error if seller is not verified => /api/v1/seller/login', async () => {
    //     const sellerCredentials = { email: createdRecordObject.email, password: "123" }

    //     const response = await request(app)
    //         .post(`${baseUrl}/login`)
    //         .set(requestHeaders)
    //         .send(sellerCredentials);

    //     expect(response.status).toBe(200);
    //     expect(response.body).toHaveProperty('token');
    // });


   

    afterAll((done) => {
        mongoDB.disconnect(done);
    });

});
