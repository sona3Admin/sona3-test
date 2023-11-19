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
let createdProductObject;


let schema = {
    descriptionEn: "string",
    descriptionAr: "string",
    stock: "number",
    quantity: "number",
    price: "number",
    originalPrice: "number",
    isActive: true
};

let productSchema = {
    nameEn: 'string',
    nameAr: 'string',
    descriptionEn: "string",
    descriptionAr: "string",
    isVerified: true,
    isActive: true,
    creationDate: "date"
};

beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Variation Module Endpoints <=====', () => {


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


    it('should create a new product | endpoint => /api/v1/admin/products/create', async () => {
        let productData = generateDummyDataFromSchema(productSchema)

        let shop = await request(app)
            .get(`${baseUrl}/shops/list`)
            .set(requestHeaders);

        let tags = await request(app)
            .get(`${baseUrl}/tags/list`)
            .set(requestHeaders);

        let categories = await request(app)
            .get(`${baseUrl}/categories/list?type=product`)
            .set(requestHeaders);


        tags = tags.body.result.map(fieldObject => fieldObject._id)
        categories = categories.body.result.map(categoryObject => categoryObject._id)
        productData.seller = shop.body.result[0].seller._id;
        productData.shop = shop.body.result[0]._id;
        productData.tags = tags;
        productData.categories = categories;

        const response = await request(app)
            .post(`${baseUrl}/products/create`)
            .set(requestHeaders)
            .send(productData);

        expect(response.status).toBe(201);
        createdProductObject = response.body.result

    });


    it('should create a new variation | endpoint => /api/v1/admin/variations/create', async () => {
        let variationData = generateDummyDataFromSchema(schema)
        let form = await request(app)
            .get(`${baseUrl}/forms/list`)
            .set(requestHeaders);

        formFields = form.body.result[0].fields
        formFields = formFields.map((fieldObject) => { return { _id: fieldObject._id, field: fieldObject, value: { en: variationData.nameEn, ar: variationData.nameAr } } })
        variationData.seller = createdProductObject.seller;
        variationData.shop = createdProductObject.shop;
        variationData.product = createdProductObject._id
        variationData.fields = formFields


        const response = await request(app)
            .post(`${baseUrl}/variations/create`)
            .set(requestHeaders)
            .send(variationData);


        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

    });


    it('should return an error for duplicate fields | endpoint => /api/v1/admin/variations/create', async () => {
        let variationData = generateDummyDataFromSchema(schema)
        variationData.seller = createdProductObject.seller;
        variationData.shop = createdProductObject.shop;
        variationData.product = createdProductObject._id
        variationData.fields = createdRecordObject.fields
        const response = await request(app)
            .post(`${baseUrl}/variations/create`)
            .set(requestHeaders)
            .send(variationData);

        expect(response.status).toBe(409);
    });


    it('should get a specific variation | endpoint => /api/v1/admin/variations/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/variations/get?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/admin/variations/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/variations/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should list variations | endpoint => /api/v1/admin/variations/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/variations/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should update a variation | endpoint => /api/v1/admin/variations/update', async () => {

        const response = await request(app)
            .put(`${baseUrl}/variations/update?_id=${createdRecordObject._id}`)
            .set(requestHeaders)
            .send({ isActive: true });

        console.log(`response.body`, response.body);
        expect(response.status).toBe(200);
    });


    it('should delete a variation | endpoint => /api/v1/admin/variations/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/variations/remove?_id=${createdRecordObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


});


afterAll((done) => {
    mongoDB.disconnect(done);
});
