const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + Math.round(Math.random() * 100000) + path.extname(file.originalname));
	}
});

const fileFilter = (req, file, cb) => {
	const allowedTypes = /jpeg|jpg|png|gif|webp/;
	const isExtensionValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
	const isMimeTypeValid = allowedTypes.test(file.mimetype);
	if (isExtensionValid && isMimeTypeValid) {
		cb(null, true);
	} else {
		cb(new Error('Only image files are allowed!'), false);
	}
}

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

module.exports = upload;