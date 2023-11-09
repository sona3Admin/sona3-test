const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database");
const { generateDummyDataFromSchema } = require("../../helpers/randomData.helper")
let baseUrl = '/api/v1/customer';
let token
let requestHeaders = {
    'x-app-token': 'Sona3-Team',
    'accept-language': 'en',
    "Authorization": `Bearer ${token}`
};
let createdRecordObject;


let schema = {
    name: 'string',
    email: 'email',
    password: '123',
    phone: 'phone',
    address: 'string',
};

beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Customer Module Endpoints <=====', () => {

 

    it('should return unauthorized for missing token | endpoint => /api/v1/customer/*', async () => {
        const customerData = generateDummyDataFromSchema(schema)

        const response = await request(app)
            .post(`${baseUrl}/update`)
            .set({ 'x-app-token': 'Sona3-Team' })
            .send(customerData)

        expect(response.status).toBe(401);
    });


    it('should return unauthorized for invalid token | endpoint => /api/v1/customer/* ', async () => {
        const customerData = generateDummyDataFromSchema(schema)

        const invalidToken = `Bearer invalidToken`;
        const response = await request(app)
            .post(`${baseUrl}/update`)
            .set({ 'x-app-token': 'Sona3-Team', "Authorization": `${invalidToken}` })
            .send(customerData)

        expect(response.status).toBe(403);
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


    it('should authenticate a customer and return a token endpoint => /api/v1/customer/login', async () => {
        const customerCredentials = { email: createdRecordObject.email, password: "123" }
        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(customerCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        token = response.body.token
        requestHeaders["Authorization"] = `Bearer ${token}`
    });


    it('should get customer profile | endpoint => /api/v1/customer/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/get?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for unauthorized access | endpoint => /api/v1/customer/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(403);
    });


    it('should update a customer | endpoint => /api/v1/customer/update', async () => {
        const customerData = generateDummyDataFromSchema({ name: 'string' })

        const response = await request(app)
            .put(`${baseUrl}/update?_id=${createdRecordObject._id}`)
            .set(requestHeaders)
            .send(customerData);

        expect(response.status).toBe(200);
    });


    it('should return an error for duplicate email | endpoint => /api/v1/customer/update', async () => {
        let customerData = generateDummyDataFromSchema(schema)

        let response = await request(app)
            .post(`${baseUrl}/register`)
            .set(requestHeaders)
            .send(customerData);

        let newCustomerEmail = response.body.result.email
        response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send({ email: newCustomerEmail, password: "123" });

        let newToken = response.body.token

        response = await request(app)
            .put(`${baseUrl}/update?_id=${response.body.result._id}`)
            .set({ 'x-app-token': 'Sona3-Team', "Authorization": `Bearer ${newToken}` })
            .send({ email: createdRecordObject.email });

        expect(response.status).toBe(409);

    });


    it('should reset a customer password | endpoint => /api/v1/customer/password', async () => {
        const newPassword = '123';

        const response = await request(app)
            .put(`${baseUrl}/password?_id=${createdRecordObject._id}`)
            .set(requestHeaders)
            .send({ email: createdRecordObject.email, newPassword });

        expect(response.status).toBe(200);
    });


    it('should delete a customer | endpoint => /api/v1/customer/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/remove?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


});


afterAll((done) => {
    mongoDB.disconnect(done);
});