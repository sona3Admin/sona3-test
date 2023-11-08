const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database")
let baseUrl = '/api/v1/admin';

let token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTRhMmQ1NDViZjExOTA0NzI2MmUyNmIiLCJuYW1lIjoiU29uYTMgU3VwZXIgQWRtaW4iLCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInR5cGUiOiJzdXBlckFkbWluIiwiaWF0IjoxNjk5Mzg3ODAyLCJleHAiOjE2OTk0NzQyMDJ9.ZJjp9SApSkZDNVI2pDOZnymt7_4Ih4Dn98LFfNzmFsM`
let requestHeaders = {
    'x-app-token': 'Sona3-Team',
    'accept-language': 'en',
    "Authorization": `Bearer ${token}`
};


describe('=====>Testing Admin Auth Module Endpoints <=====', () => {

    beforeEach(() => {
        mongoDB.connect();
    });

    
    it('should return an error for missing headers endpoint => /api/v1/admin/login', async () => {
        const adminCredentials = {
            email: 'admin@admin.com',
            password: '123',
        };

        const response = await request(app)
            .post(`${baseUrl}/login`)
            .send(adminCredentials)

        expect(response.status).toBe(500); // Unauthorized status code
    });


    it('should authenticate an admin and return a token endpoint => /api/v1/admin/login', async () => {
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
    });


    it('should return an error for non-existent email endpoint => /api/v1/admin/login', async () => {
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


    it('should return an error for incorrect password endpoint => /api/v1/admin/login', async () => {
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


    it('should return an error for missing email or password endpoint => /api/v1/admin/login', async () => {
        
        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
    });


    it('should return a valid token in the response endpoint => /api/v1/admin/login', async () => {
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

    });


    afterAll((done) => {
        mongoDB.disconnect(done);
    });

});
