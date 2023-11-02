const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database")
let baseUrl = '/api/v1/admin';

let requestHeaders = {
    'x-app-token': 'Sona3-Team',
    'accept-language': 'en',
};


describe('Testing Admin Auth Module Endpoint => /api/v1/admin/login', () => {

    beforeEach(() => {
        mongoDB.connect();
    });

    
    it('should return an error for missing headers', async () => {
        const adminCredentials = {
            email: 'admin@admin.com',
            password: 'Admin@admin50',
        };

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .send(adminCredentials)

        expect(response.status).toBe(500); // Unauthorized status code
    });


    it('should authenticate an admin and return a token', async () => {
        const adminCredentials = {
            email: 'admin@admin.com',
            password: 'Admin@admin50',
        };

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(adminCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });


    it('should return an error for non-existent email', async () => {
        const adminCredentials = {
            email: 'notfound@email.com',
            password: 'anypassword',
        };

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(adminCredentials);

        expect(response.status).toBe(404); // Assuming 404 is used for not found
        expect(response.body).toHaveProperty('success', false);
    });


    it('should return an error for incorrect password', async () => {
        const adminCredentials = {
            email: 'admin@admin.com',
            password: 'invalidPassword',
        };

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(adminCredentials);

        expect(response.status).toBe(409); // Assuming 404 is used for not found
        expect(response.body).toHaveProperty('success', false);
    });


    it('should return an error for missing email or password', async () => {
        const adminCredentials = {
            // Missing email or password
        };

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(adminCredentials);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
    });


    it('should return a valid token in the response', async () => {
        const adminCredentials = {
            email: 'admin@admin.com',
            password: 'Admin@admin50',
        };

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(adminCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');

    });


    afterAll((done) => {
        mongoDB.disconnect(done);
    });

});
