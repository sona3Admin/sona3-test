const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database");
const { generateDummyDataFromSchema } = require("../../helpers/randomData.helper")
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
    type: "product",
    isSubCategory: "boolean",
    isVerified: "boolean",
    isActive: "boolean"
};

beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Category Module Endpoints <=====', () => {


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


    it('should create a new category | endpoint => /api/v1/admin/categories/create', async () => {
        const categoryData = generateDummyDataFromSchema(schema)

        const response = await request(app)
            .post(`${baseUrl}/categories/create`)
            .set(requestHeaders)
            .send(categoryData);

        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

    });


    it('should return an error for duplicate names | endpoint => /api/v1/admin/categories/create', async () => {
        const response = await request(app)
            .post(`${baseUrl}/categories/create`)
            .set(requestHeaders)
            .send({ name: "admin", email: createdRecordObject.email, password: "123" });

        expect(response.status).toBe(409);
    });


    it('should get a specific category | endpoint => /api/v1/admin/categories/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/categories/get?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/admin/categories/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/categories/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should list categories | endpoint => /api/v1/admin/categories/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/categories/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should update a category | endpoint => /api/v1/admin/categories/update', async () => {

        const response = await request(app)
            .put(`${baseUrl}/categories/update?_id=${createdRecordObject._id}`)
            .set(requestHeaders)
            .send({ permissions: createdRecordObject.permissions });

        expect(response.status).toBe(200);
    });


    it('should delete a category | endpoint => /api/v1/admin/categories/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/categories/remove?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


});


afterAll((done) => {
    mongoDB.disconnect(done);
});
