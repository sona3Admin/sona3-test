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
    type: chooseRandomEnumValue(["product", "service"]),
    isVerified: true,
    isActive: true
};

beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Form Module Endpoints <=====', () => {


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


    it('should create a new form | endpoint => /api/v1/admin/forms/create', async () => {
        let formData = generateDummyDataFromSchema(schema)

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


    it('should return an error for duplicate names | endpoint => /api/v1/admin/forms/create', async () => {
        let formData = generateDummyDataFromSchema(schema)
        formData.nameEn = createdRecordObject.nameEn;
        formData.nameAr = createdRecordObject.nameAr
        const response = await request(app)
            .post(`${baseUrl}/forms/create`)
            .set(requestHeaders)
            .send(formData);

        expect(response.status).toBe(409);
    });


    it('should get a specific form | endpoint => /api/v1/admin/forms/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/forms/get?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/admin/forms/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/forms/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should list forms | endpoint => /api/v1/admin/forms/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/forms/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should update a form | endpoint => /api/v1/admin/forms/update', async () => {

        const response = await request(app)
            .put(`${baseUrl}/forms/update?_id=${createdRecordObject._id}`)
            .set(requestHeaders)
            .send({ isActive: true });

        expect(response.status).toBe(200);
    });


    it('should delete a form | endpoint => /api/v1/admin/forms/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/forms/remove?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


});


afterAll((done) => {
    mongoDB.disconnect(done);
});
