const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database");
const { generateDummyDataFromSchema } = require("../../helpers/randomData.helper")
let baseUrl = '/api/v1/seller';
let token
let requestHeaders = {
    'x-app-token': 'Sona3-Team',
    'accept-language': 'en',
    "Authorization": `Bearer ${token}`
};

let createdRecordObject;
let createdSellerObject;
let createdShopObject;

let schema = {
    nameEn: 'string',
    nameAr: 'string',
    descriptionEn: "string",
    descriptionAr: "string",
    isVerified: true,
    isActive: true
};

beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Product Module Endpoints <=====', () => {


    it('should register a new seller | endpoint => /api/v1/seller/register', async () => {
        const sellerData = generateDummyDataFromSchema({
            userName: 'string', email: 'email', password: '123', phone: 'phone', address: 'string', isActive: true, isVerified: true
        })

        const response = await request(app)
            .post(`${baseUrl}/register`)
            .set(requestHeaders)
            .send(sellerData);

        expect(response.status).toBe(201);
        createdSellerObject = response.body.result

    });


    it('should authenticate an seller and return a token endpoint => /api/v1/seller/login', async () => {
        const sellerCredentials = { email: createdSellerObject.email, password: "123" }
        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(sellerCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        token = response.body.token
        requestHeaders["Authorization"] = `Bearer ${token}`
    });


    it('should create a new shop | endpoint => /api/v1/seller/shops/create', async () => {
        let shopData = generateDummyDataFromSchema(schema)

        let categories = await request(app)
            .get(`${baseUrl}/categories/list?type=product`)
            .set(requestHeaders);

        seller = createdSellerObject._id
        categories = categories.body.result.map(categoryObject => categoryObject._id)
        shopData.seller = seller
        shopData.categories = categories
        const response = await request(app)
            .post(`${baseUrl}/shops/create`)
            .set(requestHeaders)
            .send(shopData);

        expect(response.status).toBe(201);
        createdShopObject = response.body.result

    });


    it('should create a new product | endpoint => /api/v1/seller/products/create', async () => {
        let productData = generateDummyDataFromSchema(schema)

        let tags = await request(app)
            .get(`${baseUrl}/tags/list`)
            .set(requestHeaders);

        let categories = await request(app)
            .get(`${baseUrl}/categories/list?type=product`)
            .set(requestHeaders);


        tags = tags.body.result.map(fieldObject => fieldObject._id)
        categories = categories.body.result.map(categoryObject => categoryObject._id)
        productData.seller = createdSellerObject._id;
        productData.shop = createdShopObject._id;
        productData.tags = tags;
        productData.categories = categories;


        const response = await request(app)
            .post(`${baseUrl}/products/create`)
            .set(requestHeaders)
            .send(productData);

        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

    });


    it('should return an error for duplicate names | endpoint => /api/v1/seller/products/create', async () => {
        let productData = generateDummyDataFromSchema(schema)
        productData.nameEn = createdRecordObject.nameEn;
        productData.nameAr = createdRecordObject.nameAr
        productData.seller = createdRecordObject.seller;
        productData.shop = createdRecordObject.shop;
        productData.tags = createdRecordObject.tags;
        productData.categories = createdRecordObject.categories;
        const response = await request(app)
            .post(`${baseUrl}/products/create`)
            .set(requestHeaders)
            .send(productData);

        expect(response.status).toBe(409);
    });


    it('should get a specific product | endpoint => /api/v1/seller/products/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/products/get?_id=${createdRecordObject._id}&seller=${createdSellerObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/seller/products/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/products/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should list products | endpoint => /api/v1/seller/products/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/products/list?seller=${createdSellerObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should update a product | endpoint => /api/v1/seller/products/update', async () => {

        const response = await request(app)
            .put(`${baseUrl}/products/update?_id=${createdRecordObject._id}&seller=${createdSellerObject._id}`)
            .set(requestHeaders)
            .send({ isActive: true });

        expect(response.status).toBe(200);
    });


    it('should delete a product | endpoint => /api/v1/seller/products/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/products/remove?_id=${createdRecordObject._id}&seller=${createdSellerObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


});


afterAll((done) => {
    mongoDB.disconnect(done);
});
