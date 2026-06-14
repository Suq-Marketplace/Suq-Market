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
        
        const productIds = {};
        for (const product of products) {
            const result = await pool.query(
                `INSERT INTO products (name, slug, description, price, stock_quantity, category, seller_id, sku, images) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                 RETURNING id`,
                [product.name, product.slug, product.description, product.price, product.stock, 
                 product.category, userIds[product.seller], product.sku, 
                 ['https://images.unsplash.com/placeholder.jpg?w=300']]
            );
            productIds[product.slug] = result.rows[0].id;
        }
        console.log(`Created ${products.length} products\n`);

        console.log(' Creating blog posts...');
        
        const postsData = [
            { title: 'Welcome to SUQ Marketplace', slug: 'welcome-to-suq', 
              content: '<p>We are excited to launch our marketplace platform!</p><p>SUQ connects local sellers with buyers looking for unique, high-quality items.</p><p>Start exploring today and discover your next treasure!</p><p><strong>About the author:</strong> John has been selling vintage items for 5 years.</p>',
              excerpt: 'Announcing the launch of SUQ Marketplace', author: 'john_doe', status: 'published' },
            { title: 'How to Choose Vintage Clothing', slug: 'vintage-clothing-guide',
              content: '<p>Vintage shopping can be overwhelming.</p><p><strong>Tips:</strong></p><ul><li>Check fabric composition</li><li>Look for wear signs</li><li>Know your measurements</li></ul><p><em>- John Doe, Vintage Specialist</em></p>',
              excerpt: 'A buyer\'s guide to authentic vintage fashion', author: 'john_doe', status: 'published' },
            { title: 'Tech Gift Guide 2026', slug: 'tech-gift-guide',
              content: '<p>Top tech picks:</p><ul><li>Wireless Headphones</li><li>Smart Watch</li><li>Mechanical Keyboard</li></ul>',
              excerpt: 'Best tech gifts under $150', author: 'john_doe', status: 'published' },
            { title: 'Caring for Leather Goods', slug: 'leather-care',
              content: '<p>Leather care tips:</p><ul><li>Condition every 6 months</li><li>Keep from direct sunlight</li><li>Clean spills immediately</li></ul>',
              excerpt: 'How to maintain leather items', author: 'john_doe', status: 'published' },
            { title: '10 Books Every Developer Should Read', slug: 'developer-books',
              content: '<p>Essential programming books:</p><ol><li>Clean Code</li><li>The Pragmatic Programmer</li><li>You Don\'t Know JS</li></ol>',
              excerpt: 'Must-read books for coders', author: 'john_doe', status: 'published' },
            { title: 'Sustainable Living Tips', slug: 'sustainable-living',
              content: '<p>Small changes, big impact:</p><ul><li>Buy second-hand</li><li>Choose handmade</li><li>Compost kitchen scraps</li></ul>',
              excerpt: 'Reduce your environmental footprint', author: 'john_doe', status: 'published' },
            { title: 'Weekend Home Decor Projects', slug: 'home-decor',
              content: '<p>Transform your space:</p><ul><li>Add indoor plants</li><li>Use throw blankets</li><li>Display ceramics as art</li></ul>',
              excerpt: 'Easy ways to refresh your home', author: 'john_doe', status: 'published' },
            { title: 'Meditation for Mental Health', slug: 'meditation-guide',
              content: '<p>10 minutes a day can reduce anxiety.</p><p>Find a quiet space, set a timer, focus on your breath.</p>',
              excerpt: 'A simple practice for a calmer mind', author: 'john_doe', status: 'published' },
            
            { title: 'Behind the Scenes: Handmade Ceramics', slug: 'handmade-ceramics',
              content: '<p>Each piece is hand-thrown, kiln-fired twice.</p><p>No two pieces are exactly alike!</p><p><strong>About me:</strong> I\'ve been creating pottery for 8 years. - Jane</p>',
              excerpt: 'Meet the makers behind our handmade collection', author: 'jane_smith', status: 'published' },
            { title: '5 Reasons to Buy Local', slug: 'buy-local',
              content: '<ol><li>Unique products</li><li>Better quality</li><li>Lower carbon footprint</li><li>Support local economy</li><li>Personal connection</li></ol>',
              excerpt: 'Why shopping locally benefits everyone', author: 'jane_smith', status: 'published' },
            { title: 'Kitchen Essentials for Home Cooks', slug: 'kitchen-essentials',
              content: '<p>Must-have tools:</p><ul><li>Cast iron skillet</li><li>Wooden cutting board</li><li>Quality knives</li></ul>',
              excerpt: 'Must-have kitchen tools', author: 'jane_smith', status: 'published' },
            { title: 'Fitness at Home: Essential Gear', slug: 'home-fitness',
              content: '<p>Build your home gym:</p><ul><li>Yoga Mat</li><li>Resistance Bands</li><li>Adjustable Dumbbells</li></ul>',
              excerpt: 'Home gym on a budget', author: 'jane_smith', status: 'published' },
            { title: 'Skincare Routine for Beginners', slug: 'skincare-beginner',
              content: '<p>Simple 3-step routine:</p><ol><li>Cleanse</li><li>Moisturize</li><li>Sunscreen</li></ol>',
              excerpt: 'Start your skincare journey', author: 'jane_smith', status: 'published' },
            { title: 'Beginner\'s Guide to Coffee Brewing', slug: 'coffee-guide',
              content: '<p>Great coffee tips:</p><ul><li>Fresh beans</li><li>Burr grinder</li><li>Filtered water</li></ul>',
              excerpt: 'Cafe-quality coffee at home', author: 'jane_smith', status: 'published' },
            { title: 'Pet Care 101: New Owner Guide', slug: 'pet-care-guide',
              content: '<p>Essential supplies:</p><ul><li>Food bowls</li><li>Comfortable bed</li><li>Leash and collar</li></ul><p>My dog Luna approves!</p>',
              excerpt: 'Prepare for your new pet', author: 'jane_smith', status: 'published' }
        ];
        
        const postIds = {};
        for (const post of postsData) {
            const result = await pool.query(
                `INSERT INTO posts (title, slug, content, excerpt, author_id, status) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING id`,
                [post.title, post.slug, post.content, post.excerpt, userIds[post.author], post.status]
            );
            postIds[post.slug] = result.rows[0].id;
        }
        console.log(`Created ${postsData.length} blog posts\n`);

        console.log(' Linking posts to products...');
        
        const mentions = [
            { post: 'vintage-clothing-guide', product: 'vintage-leather-jacket', type: 'featured' },
            { post: 'leather-care', product: 'vintage-leather-jacket', type: 'featured' },
            { post: 'tech-gift-guide', product: 'wireless-headphones', type: 'featured' },
            { post: 'tech-gift-guide', product: 'smart-watch', type: 'featured' },
            { post: 'tech-gift-guide', product: 'mechanical-keyboard', type: 'related' },
            { post: 'handmade-ceramics', product: 'handmade-ceramic-mug', type: 'featured' },
            { post: 'kitchen-essentials', product: 'cast-iron-skillet', type: 'featured' },
            { post: 'kitchen-essentials', product: 'wooden-cutting-board', type: 'related' },
            { post: 'home-fitness', product: 'yoga-mat', type: 'featured' },
            { post: 'home-fitness', product: 'resistance-bands', type: 'related' },
            { post: 'skincare-beginner', product: 'skincare-set', type: 'featured' },
            { post: 'home-decor', product: 'indoor-plant-set', type: 'featured' },
            { post: 'home-decor', product: 'cozy-throw-blanket', type: 'related' },
            { post: 'coffee-guide', product: 'coffee-maker', type: 'featured' },
            { post: 'pet-care-guide', product: 'pet-bed', type: 'featured' },
            { post: 'pet-care-guide', product: 'dog-leash', type: 'related' }
        ];
        
        for (const mention of mentions) {
            if (postIds[mention.post] && productIds[mention.product]) {
                await pool.query(
                    `INSERT INTO post_product_mentions (post_id, product_id, mention_type) 
                     VALUES ($1, $2, $3)
                     ON CONFLICT (post_id, product_id) DO NOTHING`,
                    [postIds[mention.post], productIds[mention.product], mention.type]
                );
            }
        }
        console.log(`Created ${mentions.length} post-product links\n`);

        console.log(' Creating sample sale...');
        
        await pool.query(
            `INSERT INTO sales (product_id, buyer_id, seller_id, quantity, unit_price, total_price, status, shipping_address)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [productIds['vintage-leather-jacket'], userIds['bob_wilson'], userIds['john_doe'], 
             1, 89.99, 89.99, 'completed', '123 Main St, Cityville']
        );
        console.log('Sample sale created\n');

        console.log(' Creating sample review...');
        
        await pool.query(
            `INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [productIds['vintage-leather-jacket'], userIds['bob_wilson'], 5, 
             'Amazing jacket!', 'Exactly as described. Great quality!', true]
        );
        console.log('Sample review created\n');
        console.log(' Creating coupons...');
        
        const coupons = [
            { code: 'WELCOME10', description: '10% off your first order', type: 'percentage', value: 10.00, min: 20.00 },
            { code: 'SUMMER20', description: '20% off summer sale', type: 'percentage', value: 20.00, min: 50.00 },
            { code: 'FREESHIP', description: 'Free shipping on orders over $75', type: 'fixed_amount', value: 0.00, min: 75.00 }
        ];
        
        for (const coupon of coupons) {
            await pool.query(
                `INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order_amount, valid_from, valid_until, usage_limit)
                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW() + INTERVAL '1 year', 100)
                 ON CONFLICT (code) DO NOTHING`,
                [coupon.code, coupon.description, coupon.type, coupon.value, coupon.min]
            );
        }
        console.log(`Created ${coupons.length} coupons\n`);

        console.log(' =========================================');
        console.log(' DATABASE SEEDING COMPLETE!');
        console.log(' =========================================');
        console.log('\n Login Credentials:');
        console.log('   Username: john_doe, jane_smith, bob_wilson, alice_brown');
        console.log('   Password: password123');
        console.log('\n Summary:');
        console.log(`   - ${categories.length} categories`);
        console.log(`   - ${users.length} users`);
        console.log(`   - ${products.length} products`);
        console.log(`   - ${postsData.length} blog posts`);
        console.log(`   - ${mentions.length} post-product links`);
        console.log(`   - ${coupons.length} coupons`);
        console.log('\n You can now start your application!');

    } catch (error) {
        console.error('Error seeding database:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

seedDatabase();