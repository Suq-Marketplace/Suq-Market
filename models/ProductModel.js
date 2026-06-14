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