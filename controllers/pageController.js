const ProductModel = require('../models/ProductModel');
const PostModel = require('../models/PostModel');
const SaleModel = require('../models/SaleModel');

async function getHome(req, res) {
    try {
        const featuredProducts = await ProductModel.getFeatured(6);
        const recentPosts = await PostModel.getRecent(3);
        
        res.render('index', { 
            title: 'Home',
            featuredProducts,
            recentPosts
        });
    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error', message: 'Error loading homepage' });
    }
}

async function getDashboard(req, res) {
    try {
        const user = req.session.user;
        const myProducts = await ProductModel.getBySeller(user.id);
        const mySales = await SaleModel.getBySeller(user.id);
        const myPurchases = await SaleModel.getByBuyer(user.id);
        const totalEarnings = await SaleModel.getTotalEarnings(user.id);
        
        res.render('dashboard', { 
            title: 'Dashboard',
            user,
            myProducts: myProducts || [],
            mySales: mySales || [],
            myPurchases: myPurchases || [],
            totalEarnings: totalEarnings || 0,
            productCount: (myProducts || []).length,
            salesCount: (mySales || []).length
        });
    } catch (error) {
        console.error(error);
        res.render('error', { 
            title: 'Error', 
            message: 'Error loading dashboard: ' + error.message 
        });
    }
}

async function getProductsPage(req, res) {
    try {
        const { category, search } = req.query;
        let products;
        let categories = await ProductModel.getCategories();
        
        if (search) {
            products = await ProductModel.search(search, category);
        } else if (category && category !== 'all') {
            products = await ProductModel.getByCategory(category);
        } else {
            products = await ProductModel.getAll(20);
        }
        
        res.render('products', { 
            title: 'All Products',
            products,
            categories,
            selectedCategory: category || 'all',
            search: search || ''
        });
    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error', message: 'Error loading products' });
    }
}

async function getProductDetail(req, res) {
    try {
        const product = await ProductModel.getBySlug(req.params.slug);
        if (!product) {
            return res.render('error', { title: 'Not Found', message: 'Product not found' });
        }
        
        const sellerProducts = await ProductModel.getBySeller(product.seller_id);
        
        res.render('product-detail', { 
            title: product.name,
            product,
            sellerProducts: sellerProducts.filter(p => p.id !== product.id).slice(0, 4)
        });
    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error', message: 'Error loading product' });
    }
}

function getLogin(req, res) {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', { title: 'Login', error: null });
}

function getRegister(req, res) {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('register', { title: 'Register', error: null });
}

// ✅ ADD THIS FUNCTION - It was missing!
function getAddProduct(req, res) {
    res.render('add-product', { title: 'Add Product', error: null });
}

async function getEditProduct(req, res) {
    try {
        const product = await ProductModel.getById(req.params.id);
        if (!product) {
            return res.render('error', { title: 'Not Found', message: 'Product not found' });
        }
        if (product.seller_id !== req.session.user.id && req.session.user.role !== 'admin') {
            return res.render('error', { title: 'Access Denied', message: 'You do not own this product' });
        }
        res.render('edit-product', { title: 'Edit Product', product, error: null });
    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error', message: 'Error loading product' });
    }
}

async function getSalesPage(req, res) {
    try {
        const user = req.session.user;
        const mySales = await SaleModel.getBySeller(user.id);
        const myPurchases = await SaleModel.getByBuyer(user.id);
        const totalEarnings = await SaleModel.getTotalEarnings(user.id);
        const totalSpent = await SaleModel.getTotalSpent(user.id);
        
        res.render('sales', { 
            title: 'Sales & Purchases',
            user,
            mySales,
            myPurchases,
            totalEarnings,
            totalSpent
        });
    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error', message: 'Error loading sales' });
    }
}

async function getInventoryPage(req, res) {
    try {
        const user = req.session.user;
        const myProducts = await ProductModel.getBySeller(user.id);
        
        res.render('inventory', { 
            title: 'Inventory',
            user,
            products: myProducts
        });
    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error', message: 'Error loading inventory' });
    }
}

async function getBlogPage(req, res) {
    try {
        const posts = await PostModel.getAll(12);
        res.render('blog', { title: 'Blog', posts });
    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error', message: 'Error loading blog' });
    }
}

async function getSinglePost(req, res) {
    try {
        const post = await PostModel.getBySlug(req.params.slug);
        if (!post) {
            return res.render('error', { title: 'Not Found', message: 'Post not found' });
        }
        res.render('post-detail', { title: post.title, post });
    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error', message: 'Error loading post' });
    }
}

module.exports = {
    getHome,
    getDashboard,
    getProductsPage,
    getProductDetail,
    getLogin,
    getRegister,
    getAddProduct,      
    getEditProduct,
    getSalesPage,
    getInventoryPage,
    getBlogPage,
    getSinglePost
};