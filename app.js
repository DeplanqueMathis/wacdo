const express = require('express');
const connectDB = require('./config/database');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

connectDB();

app.use('/products', require('./routes/products.route'));
app.use('/orders', require('./routes/orders.route'));
app.use('/menus', require('./routes/menus.route'));
app.use('/users', require('./routes/users.route'));

const file  = fs.readFileSync('./swagger.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app.listen(3030, () => {
	console.log('Server is running on http://localhost:3030');
});