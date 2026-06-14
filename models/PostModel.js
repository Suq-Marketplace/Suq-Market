const pool = require('../config/db');
class PostModel {
    static async getAll(limit = 10, offset = 0) {
        const result = await pool.query(
            `SELECT p.*, u.username as author_name, u.full_name as author_fullname
             FROM posts p
             JOIN users u ON p.author_id = u.id
             WHERE p.status = 'published'
             ORDER BY p.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    }
    
    static async getRecent(limit = 3) {
        const result = await pool.query(
            `SELECT p.*, u.username as author_name
             FROM posts p
             JOIN users u ON p.author_id = u.id
             WHERE p.status = 'published'
             ORDER BY p.created_at DESC
             LIMIT $1`,
            [limit]
        );
        return result.rows;
    }

    static async getBySlug(slug) {
        await pool.query('UPDATE posts SET view_count = view_count + 1 WHERE slug = $1', [slug]);
        
        const result = await pool.query(
            `SELECT p.*, u.username as author_name, u.full_name as author_fullname, u.bio as author_bio
             FROM posts p
             JOIN users u ON p.author_id = u.id
             WHERE p.slug = $1`,
            [slug]
        );
        return result.rows[0];
    }