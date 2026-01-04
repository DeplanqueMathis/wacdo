const express = require('express');
const {registerUser, loginUser, getUsers, updateUser, changeUserRole} = require('../controllers/users.controller');
const router = express.Router();
const {body} = require('express-validator');
const auth = require('../middlewares/auth.middleware');
const hasRole = require('../middlewares/hasRole.middleware');

router.post('/register', body('email').isEmail(), registerUser);
router.post('/login', body('email').isEmail(), loginUser);
router.get('/', auth, hasRole('admin'), getUsers);
router.post('/:id', auth, updateUser);
router.post('/change-role/:id/:role', auth, hasRole('admin'), changeUserRole);

module.exports = router;