const Order = require("../models/orders.model");

exports.getOrders = async (req, res) => {
	try {
		const user = req.user;

		let find = {};

		if(user.role == 'customer')
			find.customer = user.userId;
		if(user.role == 'reception')
			find.status = 'completed';
		if(user.role == 'preparator')
			find.status = 'pending';

		const orders = await Order
			.find(find, 'menus products status customer')
			.sort({createdAt: -1})
			.populate('products')
			.populate('menus');

		res.status(200).json(orders);
	} catch (error) {
		return res.status(500).json({ message: "Server error" });
	}
};

exports.createOrder = async (req, res) => {
	try {
		const user = req.user;
		const { products, menus } = req.body;

		const newOrder = new Order({
			products,
			menus,
			customer: user.userId
		});

		await newOrder.save();

		res.status(201).json(newOrder);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Server error" });
	}
};

exports.updateOrderStatus = async (req, res) => {
	try {
		const id = req.params.id;
		const {status} = req.body;
		
		if(!['pending', 'completed', 'delivered', 'canceled'].includes(status))
			return res.status(400).json({message: "Invalid status"});

		if(req.user.role === 'reception' && status !== 'delivered')
			return res.status(403).json({message: "Vous ne pouvez modifier le statut que pour 'delivered'"});

		if(req.user.role === 'preparator' && status !== 'completed')
			return res.status(403).json({message: "Vous ne pouvez modifier le statut que pour 'completed'"});

		if(req.user.role === 'customer' && status !== 'canceled')
			return res.status(403).json({message: "Vous n'avez pas la permission de modifier ce statut"});

		const order = await Order.findById(id);

		let oldStatus = order.status;

		// Customers can only cancel pending orders
		if(req.user.role === 'customer' && oldStatus !== 'pending' && status === 'canceled')
			return res.status(403).json({message: "Vous ne pouvez annuler que les commandes en attente"});

		// Preparator can only complete pending orders
		if(req.user.role === 'preparator' && oldStatus !== 'pending' && status === 'completed')
			return res.status(403).json({message: "Vous ne pouvez compléter que les commandes en attente"});
		
		// Reception can only deliver completed orders
		if(req.user.role === 'reception' && oldStatus !== 'completed' && status === 'delivered')
			return res.status(403).json({message: "Vous ne pouvez livrer que les commandes complétées"});

		if (!order)
			return res.status(404).json({ message: "Order not found" });

		if (status)
			order.status = status;

		const updatedOrder = await order.save();

		res.status(201).json(updatedOrder);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Server error" });
	}
};