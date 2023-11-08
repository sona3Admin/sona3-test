const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database");
const { generateDummyDataFromSchema } = require("../../helpers/randomData.helper")
let baseUrl = '/api/v1/customer';
let token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTRiMzg4OGFlOTRjYjBhNGE3MmJjZTMiLCJuYW1lIjoiTmV3IEN1c3RvbWVyIiwiZW1haWwiOiJjdXN0b21lckBjdXN0b21lci5jb20iLCJwaG9uZSI6IjAxMjc2MjU2MDI4Iiwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNjk5NDI5OTM5LCJleHAiOjE3MDIwMjE5Mzl9.w1h8neR8BKcVl76wcYawxJlvYPWTYC1pRC5WLR19g2g`
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


describe('=====>Testing Customer Module Endpoints <=====', () => {

    beforeEach(() => {
        mongoDB.connect();
    });


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


    it('should get a specific customer | endpoint => /api/v1/customer/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/get?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/customer/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should update an customer | endpoint => /api/v1/customer/update', async () => {
        const customerData = generateDummyDataFromSchema({ name: 'string' })

        const response = await request(app)
            .put(`${baseUrl}/update?_id=${createdRecordObject._id}`)
            .set(requestHeaders)
            .send(customerData);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/customer/update', async () => {
        const customerData = generateDummyDataFromSchema({ name: 'string' })
        const response = await request(app)
            .put(`${baseUrl}/update?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders)
            .send(customerData);

        expect(response.status).toBe(404);

    });


    it('should return an error for duplicate email | endpoint => /api/v1/customer/update', async () => {
        let customerData = generateDummyDataFromSchema(schema)

        let response = await request(app)
            .post(`${baseUrl}/register`)
            .set(requestHeaders)
            .send(customerData);


        response = await request(app)
            .put(`${baseUrl}/update?_id=${response.body.result._id}`)
            .set(requestHeaders)
            .send({ email: createdRecordObject.email });

        expect(response.status).toBe(409);

    });


    it('should reset an customer password | endpoint => /api/v1/customer/password', async () => {
        const newPassword = '123';

        const response = await request(app)
            .put(`${baseUrl}/password`)
            .set(requestHeaders)
            .send({ email: createdRecordObject.email, newPassword });

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/customer/password', async () => {
        const newPassword = '123';

        const response = await request(app)
            .put(`${baseUrl}/password`)
            .set(requestHeaders)
            .send({ email: "incorrect@email.com", newPassword });

        expect(response.status).toBe(404);
    });


    it('should delete an customer | endpoint => /api/v1/customer/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/remove?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/customer/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/remove?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    afterAll((done) => {
        mongoDB.disconnect(done);
    });
});
