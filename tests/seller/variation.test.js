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
let createdProductObject;


let schema = {
    descriptionEn: "string",
    descriptionAr: "string",
    stock: "number",
    packages: [
        {
            quantity: 5,
            price: 59.99,
            originalPrice: 69.99
        },
        {
            quantity: 8,
            price: 99.99,
            originalPrice: 120.99
        },
        {
            quantity: 10,
            price: 199.99,
            originalPrice: 300.99
        }
    ],
    minPackage: {
        quantity: 5,
        price: 59.99,
        originalPrice: 69.99
    },
    defaultPackage: {
        quantity: 10,
        price: 199.99,
        originalPrice: 300.99
    },
    isActive: true
};

let shopSchema = {
    nameEn: 'string',
    nameAr: 'string',
    descriptionEn: "string",
    descriptionAr: "string",
    phone: "phone",
    isVerified: true,
    isActive: true
};

let sellerSchema = {
    userName: 'string',
    email: 'email',
    password: '123',
    phone: 'phone',
    address: 'string',
    isActive: true, isVerified: true
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


describe('=====>Testing Shop Module Endpoints <=====', () => {


    it('should register a new seller | endpoint => /api/v1/seller/register', async () => {
        const sellerData = generateDummyDataFromSchema(sellerSchema)

        const response = await request(app)
            .post(`${baseUrl}/register`)
            .set(requestHeaders)
            .send(sellerData);

        expect(response.status).toBe(201);
        createdSellerObject = response.body.result

    });


    it('should authenticate a seller and return a token endpoint => /api/v1/seller/login', async () => {
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
        let shopData = generateDummyDataFromSchema(shopSchema)

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


    it('should create a new product | endpoint => /api/v1/admin/products/create', async () => {
        let productData = generateDummyDataFromSchema(productSchema)

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


    it('should get a specific variation | endpoint => /api/v1/seller/variations/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/variations/get?_id=${createdRecordObject._id}&seller=${createdSellerObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/seller/variations/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/variations/get?_id=650b327f77e8313f6966482d&seller=${createdSellerObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should list variations | endpoint => /api/v1/seller/variations/list?seller=${createdSellerObject._id}', async () => {
        const response = await request(app)
            .get(`${baseUrl}/variations/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should update a variation | endpoint => /api/v1/seller/variations/update', async () => {

        const response = await request(app)
            .put(`${baseUrl}/variations/update?_id=${createdRecordObject._id}&seller=${createdSellerObject._id}`)
            .set(requestHeaders)
            .send({ isActive: true });

        expect(response.status).toBe(200);
    });


    it('should delete a variation | endpoint => /api/v1/seller/variations/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/variations/remove?_id=${createdRecordObject._id}&seller=${createdSellerObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


});


afterAll((done) => {
    mongoDB.disconnect(done);
});
