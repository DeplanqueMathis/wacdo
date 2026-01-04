const hasRole = role => {
	return (req, res, next) => {
		try {
			const user = req.user;

			if(typeof role === 'string')
				role = [role];

			if (role.includes(user.role))
				next();
			else
				return res.status(403).json({message: "Unauthorized access"});
			
		} catch (error) {
			return res.status(401).json({message: "Veuillez vous connecter"});
		}
	}
}

module.exports = hasRole;