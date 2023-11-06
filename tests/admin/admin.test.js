const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database");
const { generateDummyDataFromSchema } = require("../../helpers/randomData.helper")
let baseUrl = '/api/v1/admin';
let token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTNhNmYwODU1ODQ1MTY5ZGZkNzJjYzkiLCJuYW1lIjoiU29uYTMgU3VwZXIgQWRtaW4iLCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInJvbGUiOiJzdXBlckFkbWluIiwiaWF0IjoxNjk4MzI4ODIzLCJleHAiOjE3MDA5MjA4MjN9.QQNPb8A3ePTf1VBVCt9SSUlZ5wtXoaG5e4rpLs-ZSUI`
let requestHeaders = {
    'x-app-token': 'Sona3-Team',
    'accept-language': 'en',
    "Authorization": `Bearer ${token}`
};
let createdRecordObject;


let schema = {
    name: 'string',
    email: 'email',
    password: 'password',
};


describe('=====>Testing Admin Module Endpoints <=====', () => {

    beforeEach(() => {
        mongoDB.connect();
    });


    it('should return unauthorized for missing token | endpoint => /api/v1/admin/*', async () => {
        const adminData = generateDummyDataFromSchema(schema)

        const response = await request(app)
            .post(`${baseUrl}/create`)
            .set({ 'x-app-token': 'Sona3-Team' })
            .send(adminData)

        expect(response.status).toBe(401);
    });


    it('should return unauthorized for invalid token | endpoint => /api/v1/admin/* ', async () => {
        const adminData = generateDummyDataFromSchema(schema)

        const invalidToken = `Bearer invalidToken`;
        const response = await request(app)
            .post(`${baseUrl}/create`)
            .set({ 'x-app-token': 'Sona3-Team', "Authorization": `${invalidToken}` })
            .send(adminData)

        expect(response.status).toBe(403);
    });


    it('should create a new admin | endpoint => /api/v1/admin/create', async () => {
        const adminData = generateDummyDataFromSchema(schema)

        const response = await request(app)
            .post(`${baseUrl}/create`)
            .set(requestHeaders)
            .send(adminData);

        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

    });


    it('should get a specific admin | endpoint => /api/v1/admin/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/get?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should list admins | endpoint => /api/v1/admin/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should update an admin | endpoint => /api/v1/admin/update', async () => {
        const adminData = generateDummyDataFromSchema({ name: 'string' })

        const response = await request(app)
            .put(`${baseUrl}/update?_id=${createdRecordObject._id}`)
            .set(requestHeaders)
            .send(adminData);

        expect(response.status).toBe(200);
    });


    it('should reset an admin password | endpoint => /api/v1/admin/password', async () => {
        const newPassword = '123';

        const response = await request(app)
            .put(`${baseUrl}/password?_id=${createdRecordObject._id}`)
            .set(requestHeaders)
            .send({ email: createdRecordObject.email, newPassword });

        expect(response.status).toBe(200);
    });


    it('should delete an admin | endpoint => /api/v1/admin/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/remove?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    afterAll((done) => {
        mongoDB.disconnect(done);
    });
});
