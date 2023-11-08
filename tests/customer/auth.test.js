const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database")
const { generateDummyDataFromSchema } = require("../../helpers/randomData.helper")
let baseUrl = '/api/v1/customer';

let requestHeaders = {
    'x-app-token': 'Sona3-Team',
    'accept-language': 'en',
};

let createdRecordObject;

let schema = {
    name: 'string',
    email: 'email',
    password: '123',
    phone: 'phone',
    address: 'string',
};

describe('=====>Testing Customer Auth Module Endpoints <=====', () => {

    beforeEach(() => {
        mongoDB.connect();
    });


    it('should register a new customer | endpoint => /api/v1/customer/register', async () => {
        const customerData = generateDummyDataFromSchema(schema)
        const response = await request(app)
            .post(`${baseUrl}/register`)
            .set(requestHeaders)
            .send(customerData);

        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

    });


    it('should return an error for duplicate emails | endpoint => /api/v1/customer/register', async () => {
        const response = await request(app)
            .post(`${baseUrl}/register`)
            .set(requestHeaders)
            .send({ name: "customer", email: createdRecordObject.email, password: "123" });

        expect(response.status).toBe(409);
    });


    it('should return an error for missing headers endpoint => /api/v1/customer/login', async () => {
        const customerCredentials = { email: createdRecordObject.email, password: "123" }

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .send(customerCredentials)

        expect(response.status).toBe(500); // Unauthorized status code
    });


    it('should authenticate an customer and return a token endpoint => /api/v1/customer/login', async () => {
        const customerCredentials = { email: createdRecordObject.email, password: "123" }
        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(customerCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });


    it('should return an error for non-existent email endpoint => /api/v1/customer/login', async () => {
        const customerCredentials = { email: 'notfound@email.com', password: 'anypassword' };

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(customerCredentials);

        expect(response.status).toBe(404); // Assuming 404 is used for not found
        expect(response.body).toHaveProperty('success', false);
    });


    it('should return an error for incorrect password endpoint => /api/v1/customer/login', async () => {
        const customerCredentials = { email: createdRecordObject.email, password: "incorrectPassword" }

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(customerCredentials);

        expect(response.status).toBe(409); // Assuming 404 is used for not found
        expect(response.body).toHaveProperty('success', false);
    });


    it('should return an error for missing email or password endpoint => /api/v1/customer/login', async () => {

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
    });


    it('should return a valid token in the response endpoint => /api/v1/customer/login', async () => {
        const customerCredentials = { email: createdRecordObject.email, password: "123" }
        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(customerCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');

    });


    // it('should return an error if customer is not verified => /api/v1/customer/login', async () => {
    //     const customerCredentials = { email: createdRecordObject.email, password: "123" }

    //     const response = await request(app)
    //         .post(`${baseUrl}/login`)
    //         .set(requestHeaders)
    //         .send(customerCredentials);

    //     expect(response.status).toBe(200);
    //     expect(response.body).toHaveProperty('token');
    // });


    // it('should return an error if customer is not active => /api/v1/customer/login', async () => {
    // const customerCredentials = { email: createdRecordObject.email, password: "123" }

    //     const response = await request(app)
    //         .post(`${baseUrl}/login`)
    //         .set(requestHeaders)
    //         .send(customerCredentials);

    //     expect(response.status).toBe(200);
    //     expect(response.body).toHaveProperty('token');
    // });

    afterAll((done) => {
        mongoDB.disconnect(done);
    });

});
