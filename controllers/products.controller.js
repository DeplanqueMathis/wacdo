const Product = require("../models/products.model");

exports.getProducts = async (req, res) => {
	try {
		const products = await Product
			.find({}, 'name description price image tags')
			.sort({ createdAt: -1 });

		res.status(200).json(products);
	} catch (error) {
		return res.status(500).json({ message: "Server error" });
	}
};

exports.createProduct = async (req, res) => {
	try {
		const { name, description, price, tags } = req.body;
		const image = req.file ? req.file.filename : null;

		const newProduct = new Product({
			name,
			description,
			price,
			tags,
			image
		});

		await newProduct.save();

		res.status(201).json(newProduct);
	} catch (error) {
		return res.status(500).json({ message: "Server error" });
	}
};

exports.updateProduct = async (req, res) => {
	try {
		const id = req.params.id;
		const { name, description, price, tags } = req.body;
		const image = req.file ? req.file.filename : null;

		const product = await Product.findById(id);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		if (name)
			product.name = name;
		if (description)
			product.description = description;
		if (price)
			product.price = price;
		if (tags)
			product.tags = tags;
		if (image)
			product.image = image;

		const updatedProduct = await product.save();

		res.status(200).json(updatedProduct);
	} catch (error) {
		return res.status(500).json({ message: "Server error" });
	}
};