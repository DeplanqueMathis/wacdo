const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
	products: {type: [mongoose.Schema.Types.ObjectId], ref: 'Product', default: []},
	menus: {type: [mongoose.Schema.Types.ObjectId], ref: 'Menu', default: []},
	status: { type: String, enum: ['pending', 'completed', 'delivered', 'canceled'], default: 'pending' },
	customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {timestamps: true});

module.exports = mongoose.model('Order', orderSchema);