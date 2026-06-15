require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } 
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

const pageRoutes = require('./routes/pageRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const postRoutes = require('./routes/postRoutes');
const saleRoutes = require('./routes/saleRoutes');

app.use('/', pageRoutes);
app.use('/api/users', userRoutes);
app.use('/products', productRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/sales', saleRoutes);

app.use((req, res) => {
    res.status(404).render('error', { 
        title: '404 - Page Not Found',
        message: 'The page you are looking for does not exist.' 
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: '500 - Server Error',
        message: 'Something went wrong on our end. Please try again later.' 
    });
});

app.listen(PORT, () => {
    console.log(`SUQ Marketplace running on http://localhost:${PORT}`);
});