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

         console.log(`Created ${users.length} users`);
        console.log(' Login credentials: username = any of above, password = password123\n');

        console.log(' Creating products...');
        
        const products = [
            { name: 'Wireless Headphones', slug: 'wireless-headphones', description: 'Noise-cancelling Bluetooth headphones with 20hr battery life. Perfect for travel and work.', price: 49.99, stock: 15, category: 'Electronics', seller: 'john_doe', sku: 'ELEC-001' },
            { name: 'Smart Watch', slug: 'smart-watch', description: 'Fitness tracker with heart rate monitor, GPS, and 7-day battery life.', price: 129.99, stock: 8, category: 'Electronics', seller: 'john_doe', sku: 'ELEC-002' },
            { name: 'Mechanical Keyboard', slug: 'mechanical-keyboard', description: 'RGB backlit mechanical keyboard with blue switches. Great for typing and gaming.', price: 79.99, stock: 12, category: 'Electronics', seller: 'john_doe', sku: 'ELEC-003' },
            { name: 'USB-C Hub', slug: 'usb-c-hub', description: '7-in-1 USB-C hub with HDMI, Ethernet, USB 3.0, and SD card reader.', price: 35.99, stock: 20, category: 'Electronics', seller: 'john_doe', sku: 'ELEC-004' },
            { name: 'Portable SSD 1TB', slug: 'portable-ssd', description: 'Ultra-fast USB 3.2 portable SSD, 1TB storage.', price: 89.99, stock: 10, category: 'Electronics', seller: 'john_doe', sku: 'ELEC-005' },
            { name: 'Wireless Mouse', slug: 'wireless-mouse', description: 'Ergonomic wireless mouse with silent clicks.', price: 24.99, stock: 25, category: 'Electronics', seller: 'jane_smith', sku: 'ELEC-006' },
            { name: 'Laptop Stand', slug: 'laptop-stand', description: 'Adjustable aluminum laptop stand, foldable for travel.', price: 34.99, stock: 18, category: 'Electronics', seller: 'jane_smith', sku: 'ELEC-007' },
            { name: 'Webcam 1080p', slug: 'webcam-1080p', description: 'Full HD webcam with built-in microphone.', price: 59.99, stock: 7, category: 'Electronics', seller: 'john_doe', sku: 'ELEC-008' },

            { name: 'Vintage Leather Jacket', slug: 'vintage-leather-jacket', description: 'Genuine leather jacket from the 1980s, excellent condition. Classic biker style.', price: 89.99, stock: 3, category: 'Vintage', seller: 'john_doe', sku: 'FASH-001' },
            { name: 'Cashmere Scarf', slug: 'cashmere-scarf', description: 'Soft 100% cashmere scarf in charcoal grey.', price: 45.00, stock: 10, category: 'Fashion', seller: 'john_doe', sku: 'FASH-002' },
            { name: 'Leather Backpack', slug: 'leather-backpack', description: 'Handcrafted full-grain leather backpack. Fits 15-inch laptop.', price: 149.99, stock: 5, category: 'Handmade', seller: 'jane_smith', sku: 'FASH-003' },
            { name: 'Wool Beanie', slug: 'wool-beanie', description: 'Warm wool beanie, one size fits all.', price: 19.99, stock: 25, category: 'Fashion', seller: 'jane_smith', sku: 'FASH-004' },
            { name: 'Cotton T-Shirt', slug: 'cotton-tshirt', description: '100% organic cotton t-shirt, available in S/M/L.', price: 24.99, stock: 30, category: 'Fashion', seller: 'john_doe', sku: 'FASH-005' },
            { name: 'Denim Jeans', slug: 'denim-jeans', description: 'Classic straight-fit denim jeans, medium wash.', price: 59.99, stock: 12, category: 'Fashion', seller: 'jane_smith', sku: 'FASH-006' },
            { name: 'Running Shoes', slug: 'running-shoes', description: 'Lightweight running shoes with cushioned sole.', price: 79.99, stock: 8, category: 'Sports', seller: 'john_doe', sku: 'FASH-007' },
            { name: 'Sunglasses', slug: 'sunglasses', description: 'Polarized UV-protection sunglasses.', price: 34.99, stock: 15, category: 'Fashion', seller: 'jane_smith', sku: 'FASH-008' },

            { name: 'Handmade Ceramic Mug', slug: 'handmade-ceramic-mug', description: 'Unique pottery mug, dishwasher and microwave safe.', price: 24.99, stock: 8, category: 'Handmade', seller: 'jane_smith', sku: 'HOME-001' },
            { name: 'Cast Iron Skillet', slug: 'cast-iron-skillet', description: 'Pre-seasoned 12-inch cast iron skillet.', price: 34.99, stock: 7, category: 'Home & Living', seller: 'jane_smith', sku: 'HOME-002' },
            { name: 'Wooden Cutting Board', slug: 'wooden-cutting-board', description: 'End-grain walnut cutting board. Handmade.', price: 59.99, stock: 6, category: 'Handmade', seller: 'jane_smith', sku: 'HOME-003' },
            { name: 'Cozy Throw Blanket', slug: 'cozy-throw-blanket', description: 'Soft fleece throw blanket, 50"x60".', price: 29.99, stock: 15, category: 'Home & Living', seller: 'john_doe', sku: 'HOME-004' },
            { name: 'Indoor Plant Set', slug: 'indoor-plant-set', description: 'Set of 3 low-maintenance indoor plants with ceramic pots.', price: 44.99, stock: 10, category: 'Home & Living', seller: 'jane_smith', sku: 'HOME-005' },
            { name: 'Aromatherapy Diffuser', slug: 'aromatherapy-diffuser', description: 'Ultrasonic essential oil diffuser with LED lights.', price: 32.99, stock: 12, category: 'Home & Living', seller: 'john_doe', sku: 'HOME-006' },
            { name: 'Coffee Maker', slug: 'coffee-maker', description: 'Programmable 12-cup coffee maker with thermal carafe.', price: 69.99, stock: 5, category: 'Home & Living', seller: 'jane_smith', sku: 'HOME-007' },
            { name: 'Bamboo Bath Mat', slug: 'bamboo-bath-mat', description: 'Sustainable bamboo bath mat, water-resistant.', price: 39.99, stock: 8, category: 'Home & Living', seller: 'john_doe', sku: 'HOME-008' },

            { name: 'Node.js Programming Book', slug: 'nodejs-book', description: 'Complete guide to Node.js development. Covers Express, databases, and deployment.', price: 34.99, stock: 5, category: 'Books', seller: 'jane_smith', sku: 'BOOK-001' },
            { name: 'The Art of Minimalism', slug: 'art-of-minimalism', description: 'Guide to living with less and finding joy in simplicity.', price: 18.99, stock: 12, category: 'Books', seller: 'john_doe', sku: 'BOOK-002' },
            { name: 'Healthy Cookbook', slug: 'healthy-cookbook', description: '100+ quick and healthy recipes for busy people.', price: 24.99, stock: 8, category: 'Books', seller: 'jane_smith', sku: 'BOOK-003' },

            { name: 'Yoga Mat', slug: 'yoga-mat', description: 'Eco-friendly non-slip yoga mat, 6mm thick.', price: 29.99, stock: 20, category: 'Sports', seller: 'john_doe', sku: 'SPRT-001' },
            { name: 'Resistance Bands Set', slug: 'resistance-bands', description: 'Set of 5 resistance bands with door anchor.', price: 24.99, stock: 30, category: 'Sports', seller: 'john_doe', sku: 'SPRT-002' },
            { name: 'Dumbbell Set', slug: 'dumbbell-set', description: 'Adjustable dumbbell set, 5-25 lbs.', price: 89.99, stock: 4, category: 'Sports', seller: 'jane_smith', sku: 'SPRT-003' },
            { name: 'Jump Rope', slug: 'jump-rope', description: 'Speed jump rope with ball bearings.', price: 12.99, stock: 40, category: 'Sports', seller: 'john_doe', sku: 'SPRT-004' },

            { name: 'Skincare Set', slug: 'skincare-set', description: 'Facial cleanser, toner, and moisturizer.', price: 49.99, stock: 10, category: 'Beauty', seller: 'jane_smith', sku: 'BEAU-001' },
            { name: 'Natural Lip Balm Set', slug: 'lip-balm-set', description: 'Set of 4 natural lip balms.', price: 14.99, stock: 25, category: 'Beauty', seller: 'john_doe', sku: 'BEAU-002' },
            { name: 'Hair Care Kit', slug: 'hair-care-kit', description: 'Shampoo, conditioner, and hair mask.', price: 39.99, stock: 8, category: 'Beauty', seller: 'jane_smith', sku: 'BEAU-003' },

            { name: 'Chess Set', slug: 'chess-set', description: 'Classic wooden chess board with magnetic pieces.', price: 39.99, stock: 8, category: 'Toys', seller: 'john_doe', sku: 'TOY-001' },
            { name: 'Puzzle 1000pc', slug: 'puzzle-1000pc', description: '1000-piece jigsaw puzzle.', price: 19.99, stock: 12, category: 'Toys', seller: 'jane_smith', sku: 'TOY-002' },
            { name: 'Building Blocks Set', slug: 'building-blocks', description: '500-piece building blocks set.', price: 29.99, stock: 10, category: 'Toys', seller: 'john_doe', sku: 'TOY-003' },

            { name: 'Dog Leash', slug: 'dog-leash', description: 'Durable 6-foot nylon dog leash with padded handle.', price: 14.99, stock: 25, category: 'Pet Supplies', seller: 'jane_smith', sku: 'PET-001' },
            { name: 'Cat Scratching Post', slug: 'cat-scratching-post', description: '32-inch scratching post with dangling toy.', price: 34.99, stock: 6, category: 'Pet Supplies', seller: 'john_doe', sku: 'PET-002' },
            { name: 'Pet Bed', slug: 'pet-bed', description: 'Orthopedic memory foam pet bed, washable cover.', price: 49.99, stock: 8, category: 'Pet Supplies', seller: 'jane_smith', sku: 'PET-003' }
        ];