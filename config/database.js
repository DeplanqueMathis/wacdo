const {default: mongoose} = require('mongoose');

const connectDB = async () => {
	try {
		await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wbqw8ud.mongodb.net/?appName=Cluster0`)
		console.log('Database connected successfully');
	} catch (error) {
		console.error('Database connection error:', error);
	}
}

module.exports = connectDB;