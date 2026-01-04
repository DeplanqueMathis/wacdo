const Menu = require("../models/menus.model");

exports.getMenus = async (req, res) => {
	try {
		const menus = await Menu
			.find({}, 'name description price products tags image')
			.sort({ createdAt: -1 })
			.populate('products');

		res.status(200).json(menus);
	} catch (error) {
		return res.status(500).json({ message: "Server error" });
	}
};

exports.createMenu = async (req, res) => {
	try {
		const { name, description, price, products, tags } = req.body;
		const image = req.file ? req.file.filename : null;

		const newMenu = new Menu({
			name,
			description,
			price,
			products,
			tags,
			image
		});

		await newMenu.save();

		res.status(201).json(newMenu);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Server error" });
	}
};

exports.updateMenu = async (req, res) => {
	try {
		const id = req.params.id;
		const { name, description, price, products, tags } = req.body;
		const image = req.file ? req.file.filename : null;

		const menu = await Menu.findById(id);

		if (!menu) {
			return res.status(404).json({ message: "Menu not found" });
		}

		if (name)
			menu.name = name;
		if (description)
			menu.description = description;
		if (price)
			menu.price = price;
		if (products)
			menu.products = products;
		if (tags)
			menu.tags = tags;
		if (image)
			menu.image = image;

		const updatedMenu = await menu.save();

		res.status(200).json(updatedMenu);
	} catch (error) {
		return res.status(500).json({ message: "Server error" });
	}
};