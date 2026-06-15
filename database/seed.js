const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'suq_marketplace',
});

const userIds = {};

async function seedDatabase() {
    try {
        console.log('Starting to seed database...\n');
        console.log('Cleaning existing data...');
        await pool.query('TRUNCATE TABLE post_product_mentions, reviews, sales, cart, wishlist, notifications, posts, products, users, categories RESTART IDENTITY CASCADE');
        console.log('Cleanup complete\n');
        console.log('Creating categories...');

        const categories = [
            { name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and tech accessories' },
            { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, and accessories' },
            { name: 'Home & Living', slug: 'home-living', description: 'Furniture, decor, and kitchen items' },
            { name: 'Books', slug: 'books', description: 'New and used books' },
            { name: 'Handmade', slug: 'handmade', description: 'Crafted by artisans' },
            { name: 'Vintage', slug: 'vintage', description: 'Classic and retro items' },
            { name: 'Sports', slug: 'sports', description: 'Sports equipment and outdoor gear' },
            { name: 'Beauty', slug: 'beauty', description: 'Skincare, makeup, and personal care' },
            { name: 'Toys', slug: 'toys', description: 'Games, puzzles, and collectibles' },
            { name: 'Pet Supplies', slug: 'pet-supplies', description: 'Food, toys, and accessories for pets' }
        ];

        for (const cat of categories) {
            await pool.query(
                `INSERT INTO categories (name, slug, description) 
                 VALUES ($1, $2, $3) 
                 ON CONFLICT (name) DO NOTHING`,
                [cat.name, cat.slug, cat.description]
            );
        }
        console.log(`Created ${categories.length} categories\n`);
        console.log('Creating users...');
        
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const users = [
            { username: 'john_doe', email: 'john@example.com', full_name: 'John Doe', bio: 'Selling vintage items since 2020. Love finding unique pieces for my customers!', role: 'seller' },
            { username: 'jane_smith', email: 'jane@example.com', full_name: 'Jane Smith', bio: 'Handmade crafts enthusiast. I create pottery, ceramics, and home decor.', role: 'seller' },
            { username: 'bob_wilson', email: 'bob@example.com', full_name: 'Bob Wilson', bio: 'Tech reviewer and gadget lover. Always looking for the next best thing.', role: 'user' },
            { username: 'alice_brown', email: 'alice@example.com', full_name: 'Alice Brown', bio: 'Book collector and avid reader. I buy and sell vintage books.', role: 'user' }
        ];

        for (const user of users) {
            const result = await pool.query(
                `INSERT INTO users (username, email, password_hash, full_name, bio, role) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING id`,
                [user.username, user.email, hashedPassword, user.full_name, user.bio, user.role]
            );
            userIds[user.username] = result.rows[0].id;
        }