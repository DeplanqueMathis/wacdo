const express = require('express');
const { getOrders, createOrder, updateOrderStatus } = require('../controllers/orders.controller');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const hasRole = require('../middlewares/hasRole.middleware');

router.get('/', auth, getOrders);
router.post('/', auth, hasRole(['customer', 'reception']), createOrder);
router.put('/:id/status', auth, updateOrderStatus);

module.exports = router;