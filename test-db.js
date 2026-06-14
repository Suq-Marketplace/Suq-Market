// test-db.js - Quick test to verify database connection and data
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'suq_marketplace',
});

async function testDatabase() {
    try {
        console.log('🔍 Testing database connection...\n');
        
        // Test 1: Count users
        const usersResult = await pool.query('SELECT COUNT(*) FROM users');
        console.log(`✅ Users: ${usersResult.rows[0].count} users found`);
        
        // Test 2: List users (without passwords)
        const users = await pool.query('SELECT id, username, email, role FROM users');
        console.log('   Users list:');
        users.rows.forEach(u => {
            console.log(`     - ${u.username} (${u.role})`);
        });
        
        // Test 3: Count products
        const productsResult = await pool.query('SELECT COUNT(*) FROM products');
        console.log(`\n✅ Products: ${productsResult.rows[0].count} products found`);
        
        // Test 4: Sample products
        const products = await pool.query('SELECT name, price, stock_quantity FROM products LIMIT 5');
        console.log('   Sample products:');
        products.rows.forEach(p => {
            console.log(`     - ${p.name}: $${p.price} (${p.stock_quantity} in stock)`);
        });
        
        // Test 4: Count blog posts
        const postsResult = await pool.query('SELECT COUNT(*) FROM posts');
        console.log(`\n✅ Blog Posts: ${postsResult.rows[0].count} posts found`);
        
        // Test 5: Recent posts with authors
        const posts = await pool.query(`
            SELECT p.title, u.username as author 
            FROM posts p
            JOIN users u ON p.author_id = u.id
            LIMIT 5
        `);
        console.log('   Recent posts:');
        posts.rows.forEach(p => {
            console.log(`     - "${p.title}" by ${p.author}`);
        });
        
        // Test 6: Test login credentials
        const loginTest = await pool.query(
            'SELECT username, role FROM users WHERE username = $1',
            ['john_doe']
        );
        if (loginTest.rows[0]) {
            console.log(`\n✅ Login test: john_doe exists (role: ${loginTest.rows[0].role})`);
            console.log('   Password for all users: "password123"');
        }
        
        console.log('\n🎉 All database tests passed! Your data is ready!');
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    } finally {
        await pool.end();
    }
}

testDatabase();