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

describe("GET /users", () => {
	it("should list users", async () => {
		await request(app)
			.post('/users/register')
			.send({name: "Test user", firstName: "user", email: "test@example.com", password: "Password@123"});
		
		const getUsers = await request(app)
			.get(`/users`);
		
		expect(getUsers.statusCode).toBe(200);
		expect(getUsers.body).toHaveLength(1);
	});
});

describe("POST /users/register", () => {
	it("should create a user", async () => {
		const userResponse = await request(app)
			.post('/users/register')
			.send({name: "Test user", firstName: "user", email: "test2@example.com", password: "Password@123"});
		
		expect(userResponse.statusCode).toBe(201);
		expect(userResponse.body.message).toBe('User registered successfully');
	});
	it("should throw error password or email required", async () => {
		const userResponse = await request(app)
			.post('/users/register')
			.send({name: "Test user", firstName: "user", password: "Password@123"});
		
		expect(userResponse.statusCode).toBe(400);
		expect(userResponse.body.message).toBe("Email and password are required");
	});
	it("should throw error password not provided", async () => {
		const userResponse = await request(app)
			.post('/users/register')
			.send({name: "Test user", firstName: "user", email: "test@example.com", password: "password"});
		
		expect(userResponse.statusCode).toBe(400);
		expect(userResponse.body.message).toBe("Password must be at least 8 characters long, contain uppercase and lowercase letters, digits, symbols, and have no spaces");
	});
	it("should throw error email already exists", async () => {
		await request(app)
			.post('/users/register')
			.send({name: "Test user", firstName: "user", email: "test@example.com", password: "Password@123"});
		
		const userResponse = await request(app)
			.post('/users/register')
			.send({name: "Test user", firstName: "user", email: "test@example.com", password: "Password@123"});
		
		expect(userResponse.statusCode).toBe(400);
		expect(userResponse.body.message).toBe("Email already in use");
	});
});
describe("POST /users/login", () => {
	it("should login a user", async () => {
		await request(app)
			.post('/users/register')
			.send({name: "Test user", firstName: "user", email: "test@example.com", password: "Password@123"});
		
		const loginResponse = await request(app)
			.post('/users/login')
			.send({email: "test@example.com", password: "Password@123"});
		
		expect(loginResponse.statusCode).toBe(200);
		expect(loginResponse.body).toHaveProperty('token');
		expect(loginResponse.body).toHaveProperty('user');
	});
	it("should throw error invalid credentials", async () => {
		const loginResponse = await request(app)
			.post('/users/login')
			.send({email: "test@example.com", password: "Password@1234"});
		expect(loginResponse.statusCode).toBe(400);
		expect(loginResponse.body.message).toBe("Invalid email or password");
	});
	it("should throw error invalid email", async () => {
		const loginResponse = await request(app)
			.post('/users/login')
			.send({email: "test@examplee.com", password: "Password@123"});
		expect(loginResponse.statusCode).toBe(400);
		expect(loginResponse.body.message).toBe("Invalid email or password");
	});
	it("should throw error email or password required", async () => {
		const loginResponse = await request(app)
			.post('/users/login')
			.send({email: "test@example.com"});
		expect(loginResponse.statusCode).toBe(400);
		expect(loginResponse.body.message).toBe("Email and password are required");
	});
});

describe("PUT /users/:id", () => {
	it("should update a user", async () => {
		await request(app)
			.post('/users/register')
			.send({name: "Test user", firstName: "user", email: "test42@example.com", password: "Password@123"});
		
		const user = await request(app)
			.post('/users/login')
			.send({email: "test42@example.com", password: "Password@123"});
		
		const userId = user.body.user._id;

		const updateResponse = await request(app)
			.put(`/users/${userId}`)
			.send({name: "Updated user", firstName: "updated"});
		
		expect(updateResponse.statusCode).toBe(200);
		expect(updateResponse.body.name).toBe("Updated user");
		expect(updateResponse.body.firstName).toBe("updated");
	});
	it("should not found user", async () => {
		const updateResponse = await request(app)
			.put(`/users/609e129e1c4ae72f3492b123`)
			.send({name: "Updated user", firstName: "updated"});
		
		expect(updateResponse.statusCode).toBe(404);
	});
});

describe("PUT /users/change-role/:id/:role", () => {
	it("should update role", async () => {
		await request(app)
			.post('/users/register')
			.send({name: "Test user", firstName: "user", email: "test@exemple.com", password: "Password@123"});
		
		const user = await request(app)
			.post('/users/login')
			.send({email: "test@exemple.com", password: "Password@123"});
				
		const userId = user.body.user._id;
		
		const updateResponse = await request(app)
			.put(`/users/change-role/${userId}/reception`)
			.send();
		
		expect(updateResponse.statusCode).toBe(201);
		expect(updateResponse.body.role).toBe("reception");
	});
	it("should throw error role not existing", async () => {
		await request(app)
			.post('/users/register')
			.send({name: "Test user", firstName: "user", email: "test42@example.com", password: "Password@123"});
		const user = await request(app)
			.post('/users/login')
			.send({email: "test42@example.com", password: "Password@123"});
		const userId = user.body.user._id;
		
		const updateResponse = await request(app)
			.put(`/users/change-role/${userId}/test`)
			.send();
		expect(updateResponse.statusCode).toBe(400);
		expect(updateResponse.body.message).toBe("Invalid role");
	});
	it("should not found user", async () => {
		const updateResponse = await request(app)
			.put(`/users/change-role/609e129e1c4ae72f3492b123/reception`)
			.send();
		
		expect(updateResponse.statusCode).toBe(404);
	});
});