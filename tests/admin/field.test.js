const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database");
const { generateDummyDataFromSchema, chooseRandomEnumValue } = require("../../helpers/randomData.helper")
let baseUrl = '/api/v1/admin';
let token
let requestHeaders = {
    'x-app-token': 'Sona3-Team',
    'accept-language': 'en',
    "Authorization": `Bearer ${token}`
};

let createdRecordObject;


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


    it('should authenticate a super admin and return a token endpoint => /api/v1/admin/login', async () => {
        const adminCredentials = {
            email: 'admin@admin.com',
            password: '123',
        };

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(adminCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        token = response.body.token
        requestHeaders["Authorization"] = `Bearer ${token}`
    });


    it('should create a new field | endpoint => /api/v1/admin/fields/create', async () => {
        let fieldData = generateDummyDataFromSchema(schema)
        fieldData.type = chooseRandomEnumValue(["enum", "string", "number"])
        const response = await request(app)
            .post(`${baseUrl}/fields/create`)
            .set(requestHeaders)
            .send(fieldData);

        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

    });


    it('should return an error for duplicate names | endpoint => /api/v1/admin/fields/create', async () => {
        let fieldData = generateDummyDataFromSchema(schema)
        fieldData.nameEn = createdRecordObject.nameEn;
        fieldData.nameAr = createdRecordObject.nameAr
        fieldData.type = chooseRandomEnumValue(["enum", "string", "number"])

        const response = await request(app)
            .post(`${baseUrl}/fields/create`)
            .set(requestHeaders)
            .send(fieldData);

        expect(response.status).toBe(409);
    });


    it('should get a specific field | endpoint => /api/v1/admin/fields/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/fields/get?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/admin/fields/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/fields/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should list fields | endpoint => /api/v1/admin/fields/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/fields/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should update a field | endpoint => /api/v1/admin/fields/update', async () => {
        let fieldData = generateDummyDataFromSchema(schema)
        fieldData.type = "enum"
        fieldData.values = [{ en: fieldData.nameEn, ar: fieldData.nameEn }, { en: fieldData.nameEn, ar: fieldData.nameEn }]
        const response = await request(app)
            .put(`${baseUrl}/fields/update?_id=${createdRecordObject._id}`)
            .set(requestHeaders)
            .send({ isActive: true });

        expect(response.status).toBe(200);
    });


    it('should delete a field | endpoint => /api/v1/admin/fields/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/fields/remove?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


});


afterAll((done) => {
    mongoDB.disconnect(done);
});
