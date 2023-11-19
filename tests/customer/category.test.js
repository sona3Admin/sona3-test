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
let categoryId;

let schema = {
    name: 'string',
    email: 'email',
    password: '123',
    phone: 'phone',
    address: 'string',
    isActive: true, isVerified: true
};


beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Category Module Endpoints <=====', () => {


    it('should register a new customer | endpoint => /api/v1/customer/register', async () => {
        const customerData = generateDummyDataFromSchema(schema)

        const response = await request(app)
            .post(`${baseUrl}/register`)
            .set(requestHeaders)
            .send(customerData);

        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

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


    it('should list categories | endpoint => /api/v1/seller/categories/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/categories/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
        categoryId = response.body.result[0]._id
    });


    it('should get a specific category | endpoint => /api/v1/seller/categories/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/categories/get?_id=${categoryId}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/seller/categories/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/categories/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });

});


afterAll((done) => {
    mongoDB.disconnect(done);
});
