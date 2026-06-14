const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', productController.getAllProducts);
router.get('/:slug', productController.getProduct);

router.post('/', isAuthenticated, productController.createProduct);
router.post('/:id/edit', isAuthenticated, productController.updateProduct);
router.post('/:id/delete', isAuthenticated, productController.deleteProduct);
router.post('/:id/stock', isAuthenticated, productController.updateStock);

module.exports = router;