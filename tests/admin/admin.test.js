const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database");
const generateDummyData = require("../../helpers/faker.helper")
let baseUrl = '/api/v1/admin';
let requestHeaders = {}
let token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTNhNmYwODU1ODQ1MTY5ZGZkNzJjYzkiLCJuYW1lIjoiU29uYTMgU3VwZXIgQWRtaW4iLCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInJvbGUiOiJzdXBlckFkbWluIiwiaWF0IjoxNjk4MzI4ODIzLCJleHAiOjE3MDA5MjA4MjN9.QQNPb8A3ePTf1VBVCt9SSUlZ5wtXoaG5e4rpLs-ZSUI`
let recordId

describe('Testing Admin Module Endpoints', () => {

    beforeEach(() => {
        mongoDB.connect();
    });


    requestHeaders = {
        'x-app-token': 'Sona3-Team',
        'accept-language': 'en',
        "Authorization": `Bearer ${token}`
    };


    it('Endpoint => /api/v1/admin/* should return unauthorized for missing token', async () => {
        const adminData = {
            // Provide valid admin data for creation
        };

        const response = await request(app)
            .post(`${baseUrl}/create`)
            .set({ 'x-app-token': 'Sona3-Team' })
            .send(adminData)

        expect(response.status).toBe(401);
    });


    it('Endpoint => /api/v1/admin/* should return unauthorized for invalid token', async () => {
        const adminData = {
            // Provide valid admin data for creation
        };

        const invalidToken = `Bearer invalidToken`;
        const response = await request(app)
            .post(`${baseUrl}/create`)
            .set({ 'x-app-token': 'Sona3-Team', "Authorization": `${invalidToken}` })
            .send(adminData)

        expect(response.status).toBe(401);
    });


    it('Endpoint => /api/v1/admin should create a new admin', async () => {
        const adminData = {
            // Provide valid admin data for creation
        };

        const response = await request(app)
            .post(`${baseUrl}/create`)
            .set(requestHeaders)
            .send(adminData);

        expect(response.status).toBe(201);

        recordId = response.body._id;
    });


    it('Endpoint => /api/v1/admin should update an admin', async () => {
        const updatedAdminData = {
            // Provide updated admin data
        };

        const response = await request(app)
            .put(`${baseUrl}/update?_id=${recordId}`)
            .set(requestHeaders)
            .send(updatedAdminData);

        expect(response.status).toBe(200);
    });


    it('Endpoint => /api/v1/admin should delete an admin', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/remove?_id=${recordId}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('Endpoint => /api/v1/admin should list admins', async () => {
        const response = await request(app)
            .get(`${baseUrl}/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('Endpoint => /api/v1/admin should get a specific admin', async () => {

        const response = await request(app)
            .get(`${baseUrl}/get?_id=${recordId}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('Endpoint => /api/v1/admin should reset an admin password', async () => {
        const newPassword = 'new_password';

        const response = await request(app)
            .put(`${baseUrl}/password?_id=${recordId}`)
            .set(requestHeaders)
            .send({ newPassword });

        expect(response.status).toBe(200);
    });


    afterAll((done) => {
        mongoDB.disconnect(done);
    });
});
