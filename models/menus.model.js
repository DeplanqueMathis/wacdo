const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
	name: { type: String, required: true },
	price: { type: Number, required: true },
	description: { type: String },
	image: {type: String},
	tags: {type: [String], default: []},
	products: {type: [mongoose.Schema.Types.ObjectId], ref: 'Product', default: []},
}, {timestamps: true});

module.exports = mongoose.model('Menu', menuSchema);