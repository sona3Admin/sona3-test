const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database");
const { generateDummyDataFromSchema } = require("../../helpers/randomData.helper")
let baseUrl = '/api/v1/seller';
let token
let requestHeaders = {
    'x-app-token': 'Sona3-Team',
    'accept-language': 'en',
    "Authorization": `Bearer ${token}`
};
const { logInTestEnv } = require("../../helpers/logger.helper");

let createdRecordObject;
let createdTagObject;


let schema = {
    nameEn: 'string',
    nameAr: 'string',
    isVerified: true,
    isActive: true,
    isRequested: true,
    requestDate: "date",
};

beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Tag Module Endpoints <=====', () => {


    it('should register a new seller | endpoint => /api/v1/seller/register', async () => {
        const sellerData = generateDummyDataFromSchema({
            userName: 'string', email: 'email', password: '123', phone: 'phone', address: 'string', isActive: true, isVerified: true
        })

        const response = await request(app)
            .post(`${baseUrl}/register`)
            .set(requestHeaders)
            .send(sellerData);

        expect(response.status).toBe(201);
        createdTagObject = response.body.result

    });


    it('should authenticate an seller and return a token endpoint => /api/v1/seller/login', async () => {
        const sellerCredentials = { email: createdTagObject.email, password: "123" }
        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(sellerCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        token = response.body.token
        requestHeaders["Authorization"] = `Bearer ${token}`
    });


    it('should request a new tag | endpoint => /api/v1/seller/tags/create', async () => {
        let tagData = generateDummyDataFromSchema(schema)
        tagData.requestedBy = createdTagObject._id
        const response = await request(app)
            .post(`${baseUrl}/tags/create`)
            .set(requestHeaders)
            .send(tagData);
        logInTestEnv(`response`, response.body);
        logInTestEnv(`requestHeaders`, requestHeaders.Authorization);
        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

    });


    it('should return an error for duplicate names | endpoint => /api/v1/seller/tags/create', async () => {
        let tagData = generateDummyDataFromSchema(schema)
        tagData.nameEn = createdRecordObject.nameEn;
        tagData.nameAr = createdRecordObject.nameAr
        tagData.requestedBy = createdTagObject._id

        const response = await request(app)
            .post(`${baseUrl}/tags/create`)
            .set(requestHeaders)
            .send(tagData);
        expect(response.status).toBe(409);
    });


    it('should get a specific tag | endpoint => /api/v1/seller/tags/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/tags/get?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/seller/tags/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/tags/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should list tags | endpoint => /api/v1/seller/tags/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/tags/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });

});


afterAll((done) => {
    mongoDB.disconnect(done);
});
