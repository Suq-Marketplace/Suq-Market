const pool = require('../config/db');
class ProductModel {
    static async getAll(limit = 20, offset = 0) {
        const result = await pool.query(
            `SELECT p.*, u.username as seller_name, u.full_name as seller_fullname
             FROM products p
             JOIN users u ON p.seller_id = u.id
             WHERE p.status = 'active'
             ORDER BY p.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    }

    static async getFeatured(limit = 6) {
        const result = await pool.query(
            `SELECT p.*, u.username as seller_name
             FROM products p
             JOIN users u ON p.seller_id = u.id
             WHERE p.status = 'active' AND p.stock_quantity > 0
             ORDER BY p.created_at DESC
             LIMIT $1`,
            [limit]
        );
        return result.rows;
    }

    static async getBySlug(slug) {
        const result = await pool.query(
            `SELECT p.*, u.username as seller_name, u.full_name as seller_fullname, u.bio as seller_bio
             FROM products p
             JOIN users u ON p.seller_id = u.id
             WHERE p.slug = $1`,
            [slug]
        );
        return result.rows[0];
    }

    static async getById(id) {
        const result = await pool.query(
            `SELECT p.*, u.username as seller_name
             FROM products p
             JOIN users u ON p.seller_id = u.id
             WHERE p.id = $1`,
            [id]
        );
        return result.rows[0];
    }
    static async getBySeller(sellerId) {
        const result = await pool.query(
            `SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC`,
            [sellerId]
        );
        return result.rows;
    }

    static async create(productData) {
        const { name, slug, description, price, stock_quantity, category, seller_id, sku } = productData;
        const result = await pool.query(
            `INSERT INTO products (name, slug, description, price, stock_quantity, category, seller_id, sku) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING *`,
            [name, slug, description, price, stock_quantity, category, seller_id, sku]
        );
        return result.rows[0];
    }

    static async update(id, productData) {
        const { name, description, price, stock_quantity, category } = productData;
        const result = await pool.query(
            `UPDATE products 
             SET name = $1, description = $2, price = $3, stock_quantity = $4, category = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 
             RETURNING *`,
            [name, description, price, stock_quantity, category, id]
        );
        return result.rows[0];
    }

    static async updateStock(id, quantity) {
        const result = await pool.query(
            `UPDATE products 
             SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 
             RETURNING stock_quantity`,
            [quantity, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('UPDATE products SET status = \'archived\' WHERE id = $1', [id]);
        return true;
    }

    static async search(query, category = null) {
        let sql = `
            SELECT p.*, u.username as seller_name
            FROM products p
            JOIN users u ON p.seller_id = u.id
            WHERE (p.name ILIKE $1 OR p.description ILIKE $1) AND p.status = 'active'
        `;
        const params = [`%${query}%`];
        
        if (category && category !== 'all') {
            sql += ` AND p.category = $2`;
            params.push(category);
        }
        
        sql += ` ORDER BY p.created_at DESC LIMIT 20`;
        
        const result = await pool.query(sql, params);
        return result.rows;
    }