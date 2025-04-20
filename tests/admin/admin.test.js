const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database");
const { logInTestEnv } = require("../../helpers/logger.helper");
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
    name: 'string',
    email: 'email',
    password: '123',
};

beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Admin Module Endpoints <=====', () => {


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


    it('should return an error for duplicate emails | endpoint => /api/v1/admin/create', async () => {
        const response = await request(app)
            .post(`${baseUrl}/create`)
            .set(requestHeaders)
            .send({ name: "admin", email: createdRecordObject.email, password: "123" });

        expect(response.status).toBe(409);
    });


    it('should return an error for unauthorized access | endpoint => /api/v1/admin/create', async () => {
        const adminCredentials = { email: createdRecordObject.email, password: '123' };
        const adminData = generateDummyDataFromSchema(schema)

        let response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(adminCredentials);

        let newToken = response.body.token

        response = await request(app)
            .post(`${baseUrl}/create`)
            .set({ 'x-app-token': 'Sona3-Team', "Authorization": `Bearer ${newToken}` })
            .send(adminData);

        expect(response.status).toBe(403);
    });


    it('should give access to personal profile | endpoint => /api/v1/admin/get', async () => {
        const adminCredentials = { email: createdRecordObject.email, password: '123' };

        let response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(adminCredentials);

        let newToken = response.body.token

        response = await request(app)
            .get(`${baseUrl}/get?_id=${createdRecordObject._id}`)
            .set({ 'x-app-token': 'Sona3-Team', "Authorization": `Bearer ${newToken}` })
            .send();

        expect(response.status).toBe(200);
    });


    it('should get a specific admin | endpoint => /api/v1/admin/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/get?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/admin/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
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


    it('should return an error for not found record | endpoint => /api/v1/admin/update', async () => {
        const adminData = generateDummyDataFromSchema({ name: 'string' })
        const response = await request(app)
            .put(`${baseUrl}/update?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders)
            .send(adminData);

        expect(response.status).toBe(404);

    });


    it('should return an error for duplicate email | endpoint => /api/v1/admin/update', async () => {
        let adminData = generateDummyDataFromSchema(schema)

        let response = await request(app)
            .post(`${baseUrl}/create`)
            .set(requestHeaders)
            .send(adminData);


        response = await request(app)
            .put(`${baseUrl}/update?_id=${response.body.result._id}`)
            .set(requestHeaders)
            .send({ email: createdRecordObject.email });

        expect(response.status).toBe(409);

    });


    it('should update admin role | endpoint => /api/v1/admin/role', async () => {

        const role = await request(app)
            .get(`${baseUrl}/roles/list`)
            .set(requestHeaders)
            .send();

        const response = await request(app)
            .put(`${baseUrl}/role?_id=${createdRecordObject._id}`)
            .set(requestHeaders)
            .send({ role: role.body.result[0]._id });

        expect(response.status).toBe(200);
    });


    it('should reset an admin password | endpoint => /api/v1/admin/password', async () => {
        const newPassword = '123';

        const response = await request(app)
            .put(`${baseUrl}/password`)
            .set(requestHeaders)
            .send({ email: createdRecordObject.email, newPassword });

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/admin/password', async () => {
        const newPassword = '123';

        const response = await request(app)
            .put(`${baseUrl}/password`)
            .set(requestHeaders)
            .send({ email: "incorrect@email.com", newPassword });

        expect(response.status).toBe(404);
    });


    it('should delete an admin | endpoint => /api/v1/admin/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/remove?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/admin/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/remove?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        logInTestEnv(response.body);
        expect(response.status).toBe(404);
    });

});


afterAll((done) => {
    mongoDB.disconnect(done);
});
