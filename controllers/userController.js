const UserModel = require('../models/UserModel');

async function register(req, res) {
    try {
        const { username, email, password, confirm_password, full_name, bio } = req.body;
        
        if (password !== confirm_password) {
            return res.render('register', { error: 'Passwords do not match', title: 'Register' });
        }
        
        if (password.length < 6) {
            return res.render('register', { error: 'Password must be at least 6 characters', title: 'Register' });
        }
        
        const existingUser = await UserModel.findByUsername(username);
        if (existingUser) {
            return res.render('register', { error: 'Username already taken', title: 'Register' });
        }
        
        const existingEmail = await UserModel.findByEmail(email);
        if (existingEmail) {
            return res.render('register', { error: 'Email already registered', title: 'Register' });
        }
        
        const newUser = await UserModel.create({ username, email, password, full_name, bio });
        
        req.session.user = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            full_name: newUser.full_name,
            role: newUser.role
        };
        
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('register', { error: 'Registration failed. Please try again.', title: 'Register' });
    }
}

async function login(req, res) {
    try {
        const { username, password } = req.body;
        
        let user = await UserModel.findByUsername(username);
        if (!user) {
            user = await UserModel.findByEmail(username);
        }

        if (!user || !(await UserModel.verifyPassword(password, user.password_hash))) {
            return res.render('login', { 
                error: 'Invalid email or username or password', 
                title: 'Login' 
            });
        }
        
        await UserModel.updateLastLogin(user.id);
        
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role
        };
        
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('login', { error: 'Login failed. Please try again.', title: 'Login' });
    }
}

function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/');
    });
}

module.exports = { register, login, logout };