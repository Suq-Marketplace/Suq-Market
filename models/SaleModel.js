const pool = require('../config/db');

class SaleModel {
    static async create(saleData) {
        const { product_id, buyer_id, seller_id, quantity, unit_price, total_price, shipping_address } = saleData;
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const product = await client.query('SELECT stock_quantity FROM products WHERE id = $1 FOR UPDATE', [product_id]);
            if (product.rows[0].stock_quantity < quantity) {
                throw new Error('Insufficient stock');
            }
            
            const result = await client.query(
                `INSERT INTO sales (product_id, buyer_id, seller_id, quantity, unit_price, total_price, shipping_address) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) 
                 RETURNING *`,
                [product_id, buyer_id, seller_id, quantity, unit_price, total_price, shipping_address]
            );
            
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getByBuyer(buyerId) {
        const result = await pool.query(
            `SELECT s.*, p.name as product_name, p.images, u.username as seller_name, u.full_name as seller_fullname
             FROM sales s
             JOIN products p ON s.product_id = p.id
             JOIN users u ON s.seller_id = u.id
             WHERE s.buyer_id = $1
             ORDER BY s.sale_date DESC`,
            [buyerId]
        );
        return result.rows;
    }

    static async getBySeller(sellerId) {
        const result = await pool.query(
            `SELECT s.*, p.name as product_name, p.images, u.username as buyer_name, u.full_name as buyer_fullname
             FROM sales s
             JOIN products p ON s.product_id = p.id
             JOIN users u ON s.buyer_id = u.id
             WHERE s.seller_id = $1
             ORDER BY s.sale_date DESC`,
            [sellerId]
        );
        return result.rows;
    }

    static async getTotalEarnings(sellerId) {
        const result = await pool.query(
            `SELECT COALESCE(SUM(total_price), 0) as total FROM sales WHERE seller_id = $1`,
            [sellerId]
        );
        return parseFloat(result.rows[0].total);
    }

    static async getTotalSpent(buyerId) {
        const result = await pool.query(
            `SELECT COALESCE(SUM(total_price), 0) as total FROM sales WHERE buyer_id = $1`,
            [buyerId]
        );
        return parseFloat(result.rows[0].total);
    }

    static async getCountBySeller(sellerId) {
        const result = await pool.query(
            `SELECT COUNT(*) as count FROM sales WHERE seller_id = $1`,
            [sellerId]
        );
        return parseInt(result.rows[0].count);
    }
}

module.exports = SaleModel;