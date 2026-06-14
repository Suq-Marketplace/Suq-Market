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

    static async getByAuthor(authorId) {
        const result = await pool.query(
            `SELECT * FROM posts WHERE author_id = $1 ORDER BY created_at DESC`,
            [authorId]
        );
        return result.rows;
    }

    static async create(postData) {
        const { title, slug, content, excerpt, author_id } = postData;
        const result = await pool.query(
            `INSERT INTO posts (title, slug, content, excerpt, author_id, status) 
             VALUES ($1, $2, $3, $4, $5, 'published') 
             RETURNING *`,
            [title, slug, content, excerpt, author_id]
        );
        return result.rows[0];
    }

    static async update(id, postData) {
        const { title, content, excerpt } = postData;
        const result = await pool.query(
            `UPDATE posts 
             SET title = $1, content = $2, excerpt = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 
             RETURNING *`,
            [title, content, excerpt, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('UPDATE posts SET status = \'archived\' WHERE id = $1', [id]);
        return true;
    }
    
    static async getById(id) {
        const result = await pool.query(
            `SELECT p.*, u.username as author_name, u.full_name as author_fullname
            FROM posts p
            JOIN users u ON p.author_id = u.id
            WHERE p.id = $1`,
            [id]
        );
        return result.rows[0];
    }
}

module.exports = PostModel;