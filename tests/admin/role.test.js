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
    name: 'string',
    permissions: {
        admins: ["/admin/create", "/admin/list", "/admin/get", "/admin/update", "/admin/remove", "/admin/role"],
        roles: ["/admin/roles/create", "/admin/roles/list", "/admin/roles/get", "/admin/roles/update", "/admin/roles/remove"],
        permissions: ["/admin/permissions/list"]
    }
};

beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Role Module Endpoints <=====', () => {


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


    it('should create a new role | endpoint => /api/v1/admin/roles/create', async () => {
        const roleData = generateDummyDataFromSchema(schema)

        const response = await request(app)
            .post(`${baseUrl}/roles/create`)
            .set(requestHeaders)
            .send(roleData);

        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

    });


    it('should return an error for incorrect permissions | endpoint => /api/v1/admin/roles/create', async () => {
        const response = await request(app)
            .post(`${baseUrl}/roles/create`)
            .set(requestHeaders)
            .send({ name: "incorrect role", permissions: { admin: ["/invalid/endpoint"], invalidModule: [] } });

        expect(response.status).toBe(409);
    });


    it('should get a specific role | endpoint => /api/v1/admin/roles/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/roles/get?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/admin/roles/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/roles/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should list roles | endpoint => /api/v1/admin/roles/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/roles/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should update a role | endpoint => /api/v1/admin/roles/update', async () => {

        const response = await request(app)
            .put(`${baseUrl}/roles/update?_id=${createdRecordObject._id}`)
            .set(requestHeaders)
            .send({ permissions: createdRecordObject.permissions });

        expect(response.status).toBe(200);
    });


    it('should return an error for invalid permissions | endpoint => /api/v1/admin/roles/update', async () => {

        let response = await request(app)
            .put(`${baseUrl}/roles/update?_id=${createdRecordObject._id}`)
            .set(requestHeaders)
            .send({ name: "incorrect role", permissions: { admin: ["/invalid/endpoint"], invalidModule: [] } });

        expect(response.status).toBe(409);

    });


    it('should delete a role | endpoint => /api/v1/admin/roles/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/roles/remove?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


});


afterAll((done) => {
    mongoDB.disconnect(done);
});
