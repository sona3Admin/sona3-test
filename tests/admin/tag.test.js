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
    isVerified: true,
    isActive: true
};

beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Tag Module Endpoints <=====', () => {


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


    it('should create a new tag | endpoint => /api/v1/admin/tags/create', async () => {
        const tagData = generateDummyDataFromSchema(schema)

        const response = await request(app)
            .post(`${baseUrl}/tags/create`)
            .set(requestHeaders)
            .send(tagData);

        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

    });


    it('should return an error for duplicate names | endpoint => /api/v1/admin/tags/create', async () => {
        let tagData = generateDummyDataFromSchema(schema)
        tagData.nameEn = createdRecordObject.nameEn;
        tagData.nameAr = createdRecordObject.nameAr
        const response = await request(app)
            .post(`${baseUrl}/tags/create`)
            .set(requestHeaders)
            .send(tagData);

        expect(response.status).toBe(409);
    });


    it('should get a specific tag | endpoint => /api/v1/admin/tags/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/tags/get?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/admin/tags/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/tags/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should list tags | endpoint => /api/v1/admin/tags/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/tags/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should update a tag | endpoint => /api/v1/admin/tags/update', async () => {

        const response = await request(app)
            .put(`${baseUrl}/tags/update?_id=${createdRecordObject._id}`)
            .set(requestHeaders)
            .send({ isActive: true });

        expect(response.status).toBe(200);
    });


    it('should delete a tag | endpoint => /api/v1/admin/tags/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/tags/remove?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


});


afterAll((done) => {
    mongoDB.disconnect(done);
});
