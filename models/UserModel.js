const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class UserModel {
    static async findByUsername(username) {
        const result = await pool.query(
            `SELECT id, username, email, password_hash, full_name, bio, avatar_url, role, is_active, created_at 
             FROM users WHERE username = $1`,
            [username]
        );
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await pool.query(
            `SELECT id, username, email, password_hash, full_name, bio, avatar_url, role, is_active, created_at 
             FROM users WHERE email = $1`,
            [email]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await pool.query(
            `SELECT id, username, email, full_name, bio, avatar_url, role, created_at 
             FROM users WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async create(userData) {
        const { username, email, password, full_name, bio } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash, full_name, bio, role) 
             VALUES ($1, $2, $3, $4, $5, 'user') 
             RETURNING id, username, email, full_name, role`,
            [username, email, hashedPassword, full_name, bio]
        );
        return result.rows[0];
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async updateLastLogin(id) {
        await pool.query(
            `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
            [id]
        );
    }
}

module.exports = UserModel;