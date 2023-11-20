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
    type: chooseRandomEnumValue(["product", "service"]),
    isVerified: true,
    isActive: true
};


beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Form Module Endpoints <=====', () => {

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


    it('should request a new form | endpoint => /api/v1/seller/forms/create', async () => {
        let formData = generateDummyDataFromSchema(schema)
        formData.requestedBy = createdSellerObject._id

        let fields = await request(app)
            .get(`${baseUrl}/fields/list`)
            .set(requestHeaders);

        let categories = await request(app)
            .get(`${baseUrl}/categories/list?type=${formData.type}`)
            .set(requestHeaders);


        fields = fields.body.result.map(fieldObject => fieldObject._id)
        categories = categories.body.result.map(categoryObject => categoryObject._id)
        formData.fields = fields; formData.categories = categories

        const response = await request(app)
            .post(`${baseUrl}/forms/create`)
            .set(requestHeaders)
            .send(formData);

        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

    });


    it('should return an error for duplicate names | endpoint => /api/v1/seller/forms/create', async () => {
        let formData = generateDummyDataFromSchema(schema)
        formData.nameEn = createdRecordObject.nameEn;
        formData.nameAr = createdRecordObject.nameAr
        formData.requestedBy = createdSellerObject._id

        const response = await request(app)
            .post(`${baseUrl}/forms/create`)
            .set(requestHeaders)
            .send(formData);

        expect(response.status).toBe(409);
    });


    it('should get a specific form | endpoint => /api/v1/seller/forms/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/forms/get?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/seller/forms/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/forms/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should list forms | endpoint => /api/v1/seller/forms/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/forms/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


});


afterAll((done) => {
    mongoDB.disconnect(done);
});
