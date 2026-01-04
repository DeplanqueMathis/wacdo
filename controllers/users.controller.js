const User = require("../models/users.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passwordValidator = require('password-validator');

exports.registerUser = async (req, res) => {
	try {
		const { name, firstName, email, password } = req.body;

		if (!email || !password)
			return res.status(400).json({message: "Email and password are required"});

		const schema = new passwordValidator();
		schema
			.is().min(8)
			.has().uppercase()
			.has().lowercase()
			.has().digits()
			.has().not().spaces()
			.has().symbols();
		
		if (!schema.validate(password))
			return res.status(400).json({message: "Password must be at least 8 characters long, contain uppercase and lowercase letters, digits, symbols, and have no spaces"});
		
		const existingUser = await User.findOne({email});
		
		if (existingUser)
			return res.status(400).json({message: "Email already in use"});

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = new User({
			name,
			firstName,
			email,
			password: hashedPassword,
		});

		await newUser.save();

		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		return res.status(500).json({ message: "Server error" });
	}
};

exports.loginUser = async (req, res) => {
	try {
		const {email, password} = req.body;
		
		if (!email || !password)
			return res.status(400).json({message: "Email and password are required"});

		const user = await User.findOne({email});
		
		if (!user)
			return res.status(400).json({message: "Invalid email or password"});
		
		const isMatch = await bcrypt.compare(password, user.password);
		
		if (!isMatch)
			return res.status(400).json({message: "Invalid email or password"});
		
		const token = jwt.sign({
			userId: user._id,
			role: user.role
		}, process.env.JWT_SECRET, {expiresIn: '7d'});

		return res.status(200).json({token, user});
	} catch (error) {
		console.error("Error logging in user:", error);
		return res.status(500).json({ message: "Server error" });
	}
};

exports.getUsers = async (req, res) => {
	try {
		const users = await User
			.find()
			.sort({ createdAt: -1 });

		res.status(200).json(users);
	} catch (error) {
		console.error("Error logging in user:", error);
		return res.status(500).json({ message: "Server error" });
	}
};

exports.updateUser = async (req, res) => {
	try {
		const id = req.params.id;
		const {name, firstName, email} = req.body;

		if(id !== req.user.userId && req.user.role !== 'admin')
			return res.status(403).json({message: "Unauthorized access"});

		const user = await User.findById(id);
		
		if (!user)
			return res.status(404).json({message: "User not found"});

		if (name)
			user.name = name;
		if (firstName)
			user.firstName = firstName;
		if (email)
			user.email = email;
		
		const updatedUser = await user.save();

		res.status(201).json(updatedUser);
	} catch (error) {
		console.error("Error updating user:", error);
		return res.status(500).json({ message: "Server error" });
	}
}

exports.changeUserRole = async (req, res) => {
	try {
		const id = req.params.id;
		const {role} = req.body;

		const user = await User.findById(id);
		
		if (!user)
			return res.status(404).json({message: "User not found"});

		if (role)
			user.role = role;
		
		const updatedUser = await user.save();

		res.status(201).json(updatedUser);
	} catch (error) {
		console.error("Error changing user role:", error);
		return res.status(500).json({ message: "Server error" });
	}
}