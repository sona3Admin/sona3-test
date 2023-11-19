const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database");
let baseUrl = '/api/v1/admin';
let token
let sellerId
let requestHeaders = {
    'x-app-token': 'Sona3-Team',
    'accept-language': 'en',
    "Authorization": `Bearer ${token}`
};

beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Seller Module Endpoints <=====', () => {


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


    it('should list sellers | endpoint => /api/v1/admin/sellers/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/sellers/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
        sellerId = response.body.result[0]._id

    });


    it('should get a specific seller | endpoint => /api/v1/admin/sellers/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/sellers/get?_id=${sellerId}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/admin/sellers/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/sellers/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should update a seller | endpoint => /api/v1/admin/sellers/update', async () => {

        const response = await request(app)
            .put(`${baseUrl}/sellers/update?_id=${sellerId}`)
            .set(requestHeaders)
            .send({ isActive: true });

        expect(response.status).toBe(200);
    });


    it('should delete a seller | endpoint => /api/v1/admin/sellers/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/sellers/remove?_id=${sellerId}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


});


afterAll((done) => {
    mongoDB.disconnect(done);
});
