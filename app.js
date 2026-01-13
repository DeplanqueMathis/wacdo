const express = require('express');
const connectDB = require('./config/database');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')
const path = require('path');

dotenv.config();

const app = express();
app.use(cors({
	origin: process.env.CORS_ORIGIN || 'http://localhost:1717',
}));
app.use(express.json());
app.use(express.static('uploads'));

connectDB();

app.use('/products', require('./routes/products.route'));
app.use('/orders', require('./routes/orders.route'));
app.use('/menus', require('./routes/menus.route'));
app.use('/users', require('./routes/users.route'));

const file  = fs.readFileSync(path.resolve("swagger.yaml"), 'utf8')
const swaggerDocument = YAML.parse(file)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app.listen(1717, () => {
	console.log('Server is running on http://localhost:1717');
});