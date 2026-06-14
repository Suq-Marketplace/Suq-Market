const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { isAuthenticated, isGuest } = require('../middleware/authMiddleware');

router.get('/', pageController.getHome);
router.get('/products', pageController.getProductsPage);
router.get('/products/:slug', pageController.getProductDetail);
router.get('/blog', pageController.getBlogPage);
router.get('/blog/:slug', pageController.getSinglePost);

router.get('/login', isGuest, pageController.getLogin);
router.get('/register', isGuest, pageController.getRegister);

router.get('/dashboard', isAuthenticated, pageController.getDashboard);
router.get('/products/add', isAuthenticated, pageController.getAddProduct);
router.get('/products/edit/:id', isAuthenticated, pageController.getEditProduct);
router.get('/sales', isAuthenticated, pageController.getSalesPage);
router.get('/inventory', isAuthenticated, pageController.getInventoryPage);

module.exports = router;