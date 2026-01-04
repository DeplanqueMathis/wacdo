const express = require('express');
const { getMenus, createMenu, updateMenu } = require('../controllers/menus.controller');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const hasRole = require('../middlewares/hasRole.middleware');
const upload = require('../middlewares/multer');

router.get('/', getMenus);
router.post('/', auth, hasRole('admin'), upload.single('image'), createMenu);
router.put('/:id', auth, hasRole('admin'), upload.single('image'), updateMenu);

module.exports = router;