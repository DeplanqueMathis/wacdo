const express = require('express');
const { getProducts, createProduct, updateProduct } = require('../controllers/products.controller');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const hasRole = require('../middlewares/hasRole.middleware');
const upload = require('../middlewares/multer');

router.get('/', getProducts);
router.post('/', auth, hasRole('admin'), upload.single('image'), createProduct);
router.put('/:id', auth, hasRole('admin'), upload.single('image'), updateProduct);

module.exports = router;