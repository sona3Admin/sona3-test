const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database");
let baseUrl = '/api/v1/admin';
let token
let customerId
let requestHeaders = {
    'x-app-token': 'Sona3-Team',
    'accept-language': 'en',
    "Authorization": `Bearer ${token}`
};


beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Customer Module Endpoints <=====', () => {


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


    it('should list customers | endpoint => /api/v1/admin/customers/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/customers/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
        customerId = response.body.result[0]._id

    });


    it('should get a specific customer | endpoint => /api/v1/admin/customers/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/customers/get?_id=${customerId}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/admin/customers/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/customers/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should update a customer | endpoint => /api/v1/admin/customers/update', async () => {

        const response = await request(app)
            .put(`${baseUrl}/customers/update?_id=${customerId}`)
            .set(requestHeaders)
            .send({ isActive: true });

        expect(response.status).toBe(200);
    });


    it('should delete a customer | endpoint => /api/v1/admin/customers/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/customers/remove?_id=${customerId}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


});


afterAll((done) => {
    mongoDB.disconnect(done);
});
