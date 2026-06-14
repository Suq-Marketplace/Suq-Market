const ProductModel = require('../models/ProductModel');

async function getAllProducts(req, res) {
    try {
        const products = await ProductModel.getAll(50);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getProduct(req, res) {
    try {
        const product = await ProductModel.getById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createProduct(req, res) {
    console.log('🔵 createProduct CALLED');
    console.log('Body:', req.body);
    
    try {
        const { name, description, price, stock_quantity, category } = req.body;
        
        if (!name || !price) {
            return res.render('add-product', { error: 'Name and price are required', title: 'Add Product' });
        }
        
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        const product = await ProductModel.create({
            name,
            slug,
            description: description || '',
            price: parseFloat(price),
            stock_quantity: parseInt(stock_quantity) || 0,
            category: category || 'Uncategorized',
            seller_id: req.session.user.id,
            sku: `${(category || 'GEN').toUpperCase()}-${Date.now()}`
        });
        
        console.log('✅ Product created, ID:', product.id);
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.render('add-product', { error: 'Failed to create product: ' + error.message, title: 'Add Product' });
    }
}

async function updateProduct(req, res) {
    try {
        const { name, description, price, stock_quantity, category } = req.body;
        const product = await ProductModel.getById(req.params.id);
        
        if (!product) {
            return res.status(404).render('error', { title: 'Not Found', message: 'Product not found' });
        }
        
        if (product.seller_id !== req.session.user.id && req.session.user.role !== 'admin') {
            return res.status(403).render('error', { title: 'Access Denied', message: 'You do not own this product' });
        }
        
        await ProductModel.update(product.id, {
            name: name || product.name,
            description: description || product.description,
            price: parseFloat(price) || product.price,
            stock_quantity: parseInt(stock_quantity) !== undefined ? parseInt(stock_quantity) : product.stock_quantity,
            category: category || product.category
        });
        
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error', message: 'Failed to update product' });
    }
}

async function deleteProduct(req, res) {
    try {
        const product = await ProductModel.getById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        if (product.seller_id !== req.session.user.id && req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        await ProductModel.delete(product.id);
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateStock(req, res) {
    try {
        const { quantity } = req.body;
        const product = await ProductModel.getById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        if (product.seller_id !== req.session.user.id && req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const result = await ProductModel.updateStock(product.id, parseInt(quantity));
        res.json({ success: true, stock_quantity: result.stock_quantity });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getAllProducts, getProduct, createProduct, updateProduct, deleteProduct, updateStock };