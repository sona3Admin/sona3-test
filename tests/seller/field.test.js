const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database");
const { generateDummyDataFromSchema, chooseRandomEnumValue } = require("../../helpers/randomData.helper")
let baseUrl = '/api/v1/seller';
let token
let requestHeaders = {
    'x-app-token': 'Sona3-Team',
    'accept-language': 'en',
    "Authorization": `Bearer ${token}`
};

let createdRecordObject;
let createdSellerObject;


let schema = {
    nameEn: 'string',
    nameAr: 'string',
    descriptionEn: "string",
    descriptionAr: "string",
    isRequired: "boolean",
    isVerified: true,
    isActive: true
};


beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Field Module Endpoints <=====', () => {


    it('should register a new seller | endpoint => /api/v1/seller/register', async () => {
        const sellerData = generateDummyDataFromSchema({
            userName: 'string', email: 'email', password: '123', phone: 'phone', address: 'string', isActive: true, isVerified: true
        })

        const response = await request(app)
            .post(`${baseUrl}/register`)
            .set(requestHeaders)
            .send(sellerData);

        expect(response.status).toBe(201);
        createdSellerObject = response.body.result

    });


    it('should authenticate an seller and return a token endpoint => /api/v1/seller/login', async () => {
        const sellerCredentials = { email: createdSellerObject.email, password: "123" }
        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(sellerCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        token = response.body.token
        requestHeaders["Authorization"] = `Bearer ${token}`
    });


    it('should request a new field | endpoint => /api/v1/seller/fields/create', async () => {
        let fieldData = generateDummyDataFromSchema(schema)
        fieldData.type = chooseRandomEnumValue(["enum", "string", "number"])
        fieldData.requestedBy = createdSellerObject._id
        const response = await request(app)
            .post(`${baseUrl}/fields/create`)
            .set(requestHeaders)
            .send(fieldData);

        console.log(`response.body`, response.body);
        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

    });


    it('should return an error for duplicate names | endpoint => /api/v1/seller/fields/create', async () => {
        let fieldData = generateDummyDataFromSchema(schema)
        fieldData.type = chooseRandomEnumValue(["enum", "string", "number"])
        fieldData.nameEn = createdRecordObject.nameEn;
        fieldData.nameAr = createdRecordObject.nameAr
        fieldData.requestedBy = createdSellerObject._id

        const response = await request(app)
            .post(`${baseUrl}/fields/create`)
            .set(requestHeaders)
            .send(fieldData);
        expect(response.status).toBe(409);
    });


    it('should get a specific field | endpoint => /api/v1/seller/fields/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/fields/get?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/seller/fields/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/fields/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should list fields | endpoint => /api/v1/seller/fields/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/fields/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });

});


afterAll((done) => {
    mongoDB.disconnect(done);
});
