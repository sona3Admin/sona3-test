const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database");
const { generateDummyDataFromSchema } = require("../../helpers/randomData.helper")
let baseUrl = '/api/v1/seller';
let token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTRiNGM0MjdhZTJlYjI1ODFkMzJiZjMiLCJlbWFpbCI6InNlbGxlckBzZWxsZXIuY29tIiwicGhvbmUiOiIrMjAtMzg4LTg5MC02MzAwIiwicm9sZSI6InNlbGxlciIsImlhdCI6MTY5OTQzNDUyOCwiZXhwIjoxNzAyMDI2NTI4fQ.i23B42H8mlDmEyk2vBykP4dez40AGDtMv9PZmMdiUqo`
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


describe('=====>Testing Seller Module Endpoints <=====', () => {

    beforeEach(() => {
        mongoDB.connect();
    });


    it('should return unauthorized for missing token | endpoint => /api/v1/seller/*', async () => {
        const sellerData = generateDummyDataFromSchema(schema)

        const response = await request(app)
            .post(`${baseUrl}/update`)
            .set({ 'x-app-token': 'Sona3-Team' })
            .send(sellerData)

        expect(response.status).toBe(401);
    });


    it('should return unauthorized for invalid token | endpoint => /api/v1/seller/* ', async () => {
        const sellerData = generateDummyDataFromSchema(schema)

        const invalidToken = `Bearer invalidToken`;
        const response = await request(app)
            .post(`${baseUrl}/update`)
            .set({ 'x-app-token': 'Sona3-Team', "Authorization": `${invalidToken}` })
            .send(sellerData)

        expect(response.status).toBe(403);
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


    it('should get a specific seller | endpoint => /api/v1/seller/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/get?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/seller/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should update an seller | endpoint => /api/v1/seller/update', async () => {
        const sellerData = generateDummyDataFromSchema({ userName: 'string' })

        const response = await request(app)
            .put(`${baseUrl}/update?_id=${createdRecordObject._id}`)
            .set(requestHeaders)
            .send(sellerData);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/seller/update', async () => {
        const sellerData = generateDummyDataFromSchema({ userName: 'string' })
        const response = await request(app)
            .put(`${baseUrl}/update?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders)
            .send(sellerData);

        expect(response.status).toBe(404);

    });


    it('should return an error for duplicate email | endpoint => /api/v1/seller/update', async () => {
        let sellerData = generateDummyDataFromSchema(schema)

        let response = await request(app)
            .post(`${baseUrl}/register`)
            .set(requestHeaders)
            .send(sellerData);


        response = await request(app)
            .put(`${baseUrl}/update?_id=${response.body.result._id}`)
            .set(requestHeaders)
            .send({ email: createdRecordObject.email });

        expect(response.status).toBe(409);

    });


    it('should reset an seller password | endpoint => /api/v1/seller/password', async () => {
        const newPassword = '123';

        const response = await request(app)
            .put(`${baseUrl}/password`)
            .set(requestHeaders)
            .send({ email: createdRecordObject.email, newPassword });

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/seller/password', async () => {
        const newPassword = '123';

        const response = await request(app)
            .put(`${baseUrl}/password`)
            .set(requestHeaders)
            .send({ email: "incorrect@email.com", newPassword });

        expect(response.status).toBe(404);
    });


    it('should delete an seller | endpoint => /api/v1/seller/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/remove?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/seller/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/remove?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    afterAll((done) => {
        mongoDB.disconnect(done);
    });
});
