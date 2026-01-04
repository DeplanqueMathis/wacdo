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

describe("GET /menus", () => {
	it("should list menus", async () => {
		await request(app)
			.post('/menus')
			.send({name: "Test menu", description: "A test menu", price: 9.99});

		const getMenus = await request(app)
			.get(`/menus`);
		
		expect(getMenus.statusCode).toBe(200);
		expect(getMenus.body).toHaveLength(1);
	});
});

describe("POST /menus", () => {
	it("should create a menu", async () => {
		const menuResponse = await request(app)
			.post('/menus')
			.send({name: "Test menu", description: "A test menu", price: 9.99});
		
		expect(menuResponse.statusCode).toBe(201);
		expect(menuResponse.body).toHaveProperty('_id');
		expect(menuResponse.body.name).toBe("Test menu");
		expect(menuResponse.body.description).toBe("A test menu");
		expect(menuResponse.body.price).toBe(9.99);
	});
	it("should throw error", async () => {
		const menuResponse = await request(app)
			.post('/menus')
			.send({name: "Test menu", description: "A test menu"});
		
		expect(menuResponse.statusCode).toBe(500);
	});
});

describe("PUT /menus", () => {
	it("should update a menu", async () => {
		const menuResponse = await request(app)
			.post('/menus')
			.send({name: "Test menu", description: "A test menu", price: 9.99});
		
		expect(menuResponse.statusCode).toBe(201);

		const menuId = menuResponse.body._id;

		const updateResponse = await request(app)
			.put(`/menus/${menuId}`)
			.send({name: "Updated menu", price: 19.99});
		
		expect(updateResponse.statusCode).toBe(200);
		expect(updateResponse.body.name).toBe("Updated menu");
		expect(updateResponse.body.price).toBe(19.99);
	});
	it("should not found menu", async () => {
		const updateResponse = await request(app)
			.put(`/menus/609e129e1c4ae72f3492b123`)
			.send({name: "Updated menu", price: 19.99});
		
		expect(updateResponse.statusCode).toBe(404);
	});
});