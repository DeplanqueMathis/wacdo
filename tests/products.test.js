const {MongoMemoryServer} = require("mongodb-memory-server");
const {default: mongoose} = require("mongoose");
const request = require("supertest");

jest.mock('../middlewares/auth.middleware', () => {
	return (req, res, next) => {
		req.user = {
			userId: '607f1f77bcf86cd799439011',
			role: 'admin'
		};  // Mock user for testing
		next();
	}
});
jest.mock('../config/database', () => {
	return async () => {};
});

const app = require("../app");

let mongoServer;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	await mongoose.connect(mongoServer.getUri(), {dbName: "test"});
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoServer.stop();
	await app.close();
});

describe("GET /products", () => {
	it("should list products", async () => {
		await request(app)
			.post('/products')
			.send({name: "Test product", description: "A test product", price: 9.99});
		
		const getProducts = await request(app)
			.get(`/products`);
		
		expect(getProducts.statusCode).toBe(200);
		expect(getProducts.body).toHaveLength(1);
	});
});

describe("POST /products", () => {
	it("should create a product", async () => {
		const productResponse = await request(app)
			.post('/products')
			.send({name: "Test product", description: "A test product", price: 9.99});
		
		expect(productResponse.statusCode).toBe(201);
		expect(productResponse.body).toHaveProperty('_id');
		expect(productResponse.body.name).toBe("Test product");
		expect(productResponse.body.description).toBe("A test product");
		expect(productResponse.body.price).toBe(9.99);
	});
	it("should throw error", async () => {
		const productResponse = await request(app)
			.post('/products')
			.send({name: "Test product", description: "A test product"});
		
		expect(productResponse.statusCode).toBe(500);
	});
});

describe("PUT /products", () => {
	it("should update a product", async () => {
		const productResponse = await request(app)
			.post('/products')
			.send({name: "Test product", description: "A test product", price: 9.99});
		
		expect(productResponse.statusCode).toBe(201);

		const productId = productResponse.body._id;

		const updateResponse = await request(app)
			.put(`/products/${productId}`)
			.send({name: "Updated product", price: 19.99});
		
		expect(updateResponse.statusCode).toBe(200);
		expect(updateResponse.body.name).toBe("Updated product");
		expect(updateResponse.body.price).toBe(19.99);
	});
	it("should not found product", async () => {
		const updateResponse = await request(app)
			.put(`/products/609e129e1c4ae72f3492b123`)
			.send({name: "Updated product", price: 19.99});
		
		expect(updateResponse.statusCode).toBe(404);
	});
});