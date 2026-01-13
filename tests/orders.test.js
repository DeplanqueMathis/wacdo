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

describe("GET /orders", () => {
	it("should list orders", async () => {
		const productResponse = await request(app)
			.post('/products')
			.send({name: "Test product", description: "A test product", price: 9.99});
		
		expect(productResponse.statusCode).toBe(201);

		const productId = productResponse.body._id;

		const menuResponse = await request(app)
			.post('/menus')
			.send({name: "Test menu", description: "A test menu", price: 9.99});
		
		expect(menuResponse.statusCode).toBe(201);

		const menuId = menuResponse.body._id;

		await request(app)
			.post('/orders')
			.send({products: [productId], menus: [menuId]});
		
		const getOrders = await request(app)
			.get(`/orders`);
		
		expect(getOrders.statusCode).toBe(200);
		expect(getOrders.body).toHaveLength(1);
	});
});

describe("POST /orders", () => {
	it("should create an order", async () => {
		const productResponse = await request(app)
			.post('/products')
			.send({name: "Test product", description: "A test product", price: 9.99});
		
		expect(productResponse.statusCode).toBe(201);

		const productId = productResponse.body._id;

		const menuResponse = await request(app)
			.post('/menus')
			.send({name: "Test menu", description: "A test menu", price: 9.99});
		
		expect(menuResponse.statusCode).toBe(201);

		const menuId = menuResponse.body._id;

		const orderResponse = await request(app)
			.post('/orders')
			.send({products: [productId], menus: [menuId]});
		
		expect(orderResponse.statusCode).toBe(201);
		expect(orderResponse.body).toHaveProperty('_id');
		expect(orderResponse.body.products).toStrictEqual([productId]);
		expect(orderResponse.body.menus).toStrictEqual([menuId]);
	});
	it("should throw error", async () => {
		const orderResponse = await request(app)
			.post('/orders')
			.send({products: ["test"]});
		
		expect(orderResponse.statusCode).toBe(500);
	});
});

describe("PUT /orders", () => {
	it("should change order status", async () => {
		const productResponse = await request(app)
			.post('/products')
			.send({name: "Test product", description: "A test product", price: 9.99});
		
		expect(productResponse.statusCode).toBe(201);

		const productId = productResponse.body._id;

		const menuResponse = await request(app)
			.post('/menus')
			.send({name: "Test menu", description: "A test menu", price: 9.99});
		
		expect(menuResponse.statusCode).toBe(201);

		const menuId = menuResponse.body._id;

		const orderResponse = await request(app)
			.post('/orders')
			.send({products: [productId], menus: [menuId]});
		
		expect(orderResponse.statusCode).toBe(201);

		const orderId = orderResponse.body._id;

		const updateResponse = await request(app)
			.put(`/orders/${orderId}/status`)
			.send({status: "completed"});
		
		expect(updateResponse.statusCode).toBe(201);
		expect(updateResponse.body.status).toBe("completed");
	});
	it("should not found order", async () => {
		const updateResponse = await request(app)
			.put(`/orders/609e129e1c4ae72f3492b123/status`)
			.send({status: "completed"});
		
		expect(updateResponse.statusCode).toBe(404);
	});
});