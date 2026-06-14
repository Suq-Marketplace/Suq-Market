const SaleModel = require('../models/SaleModel');
const ProductModel = require('../models/ProductModel');

async function createPurchase(req, res) {
    try {
        const { product_id, quantity, shipping_address } = req.body;
        
        const product = await ProductModel.getById(product_id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        if (product.seller_id === req.session.user.id) {
            return res.status(400).json({ error: 'You cannot buy your own product' });
        }
        
        if (product.stock_quantity < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }
        
        const total_price = product.price * quantity;
        
        const sale = await SaleModel.create({
            product_id: product.id,
            buyer_id: req.session.user.id,
            seller_id: product.seller_id,
            quantity: parseInt(quantity),
            unit_price: parseFloat(product.price),
            total_price: total_price,
            shipping_address: shipping_address || 'No address provided'
        });
        
        res.json({ success: true, sale });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

async function getMySales(req, res) {
    try {
        const sales = await SaleModel.getBySeller(req.session.user.id);
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getMyPurchases(req, res) {
    try {
        const purchases = await SaleModel.getByBuyer(req.session.user.id);
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getEarnings(req, res) {
    try {
        const total = await SaleModel.getTotalEarnings(req.session.user.id);
        const count = await SaleModel.getCountBySeller(req.session.user.id);
        res.json({ total_earnings: total, total_sales: count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { createPurchase, getMySales, getMyPurchases, getEarnings };