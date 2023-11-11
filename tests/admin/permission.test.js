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
    email: 'email',
    password: '123',
};


beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Permission Module Endpoints <=====', () => {


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


    it('should return an error for unauthorized access | endpoint => /api/v1/admin/permissions/list', async () => {
        const adminData = generateDummyDataFromSchema(schema)

        let response = await request(app)
            .post(`${baseUrl}/create`)
            .set(requestHeaders)
            .send(adminData);

        createdRecordObject = response.body.result

        const adminCredentials = { email: createdRecordObject.email, password: '123' };

        response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(adminCredentials);

        let newToken = response.body.token

        response = await request(app)
            .get(`${baseUrl}/permissions/list`)
            .set({ 'x-app-token': 'Sona3-Team', "Authorization": `Bearer ${newToken}` })
            .send();

        expect(response.status).toBe(403);
    });


    it('should list system permissions | endpoint => /api/v1/admin/permissions/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/permissions/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


});


afterAll((done) => {
    mongoDB.disconnect(done);
});
