const express = require('express');
const { authCheck } = require('../middlewares/authCheck');
const router = express.Router();
// import { authCheck } from '../middlewares/auth';
const { getOrderAdmin, changeOrderStatus } = require('../controllers/admin')

router.put('/admin/order-status', authCheck, changeOrderStatus);

router.get('/admin/orders',getOrderAdmin);

module.exports = router;