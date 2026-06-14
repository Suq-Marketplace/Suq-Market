const express = require('express');
const router = express.Router();

const ProductModel = require('../models/ProductModel');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/add', isAuthenticated, (req, res) => {
    return res.render('add-product', {
        title: 'Add Product',
        error: null
    });
});

router.get('/', async (req, res) => {
    try {
        const products = await ProductModel.getAll(50);
        return res.json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'Failed to load products'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await ProductModel.getById(req.params.id);

        if (!product) {
            return res.status(404).render('error', {
                title: 'Not Found',
                message: 'Product not found'
            });
        }

        return res.render('product-detail', {
            title: product.name,
            product
        });

    } catch (error) {
        console.error(error);

        return res.status(500).render('error', {
            title: 'Server Error',
            message: 'Failed to load product'
        });
    }
});

router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            stock_quantity,
            category
        } = req.body;

        if (!name || !price) {
            return res.render('add-product', {
                title: 'Add Product',
                error: 'Name and price are required'
            });
        }

        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const product = await ProductModel.create({
            name,
            slug,
            description: description || '',
            price: Number(price),
            stock_quantity: Number(stock_quantity) || 0,
            category: category || 'Uncategorized',
            seller_id: req.session.user.id,
            sku: `${(category || 'GEN').toUpperCase()}-${Date.now()}`
        });

        console.log('Created product:', product.id);

        return res.redirect('/dashboard');

    } catch (error) {
        console.error(error);

        return res.render('add-product', {
            title: 'Add Product',
            error: error.message
        });
    }
});

router.post('/:id/edit', isAuthenticated, async (req, res) => {
    try {
        const product = await ProductModel.getById(req.params.id);

        if (!product) {
            return res.status(404).render('error', {
                title: 'Not Found',
                message: 'Product not found'
            });
        }

        await ProductModel.update(product.id, {
            name: req.body.name || product.name,
            description: req.body.description || product.description,
            price: Number(req.body.price) || product.price,
            stock_quantity:
                Number(req.body.stock_quantity) || product.stock_quantity,
            category: req.body.category || product.category
        });

        return res.redirect('/dashboard');

    } catch (error) {
        console.error(error);

        return res.status(500).render('error', {
            title: 'Server Error',
            message: 'Failed to update product'
        });
    }
});

router.post('/:id/delete', isAuthenticated, async (req, res) => {
    try {
        await ProductModel.delete(req.params.id);
        return res.redirect('/dashboard');
    } catch (error) {
        console.error(error);

        return res.status(500).render('error', {
            title: 'Server Error',
            message: 'Failed to delete product'
        });
    }
});

module.exports = router;