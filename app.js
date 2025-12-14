const express = require('express');
const connectDB = require('./config/database');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

module.exports = app.listen(3030, () => {
	console.log('Server is running on http://localhost:3030');
});