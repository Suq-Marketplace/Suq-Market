const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/purchase', isAuthenticated, saleController.createPurchase);
router.get('/my-sales', isAuthenticated, saleController.getMySales);
router.get('/my-purchases', isAuthenticated, saleController.getMyPurchases);
router.get('/earnings', isAuthenticated, saleController.getEarnings);

module.exports = router;