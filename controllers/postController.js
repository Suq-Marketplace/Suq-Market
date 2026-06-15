const PostModel = require('../models/PostModel');
async function getAllPosts(req, res) {
    try {
        const posts = await PostModel.getAll(20);
        res.render('blog', { 
            title: 'Blog',
            posts 
        });
    } catch (error) {
        console.error(error);
        res.render('error', { 
            title: 'Error', 
            message: 'Error loading blog posts' 
        });
    }
}

async function getPostBySlug(req, res) {
    try {
        const post = await PostModel.getBySlug(req.params.slug);
        if (!post) {
            return res.render('error', { 
                title: 'Not Found', 
                message: 'Blog post not found' 
            });
        }
        res.render('post-detail', { 
            title: post.title,
            post 
        });
    } catch (error) {
        console.error(error);
        res.render('error', { 
            title: 'Error', 
            message: 'Error loading blog post' 
        });
    }
}

async function getMyPosts(req, res) {
    try {
        const posts = await PostModel.getByAuthor(req.session.user.id);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createPost(req, res) {
    try {
        const { title, content, excerpt } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        const post = await PostModel.create({
            title,
            slug,
            content,
            excerpt: excerpt || content.substring(0, 200),
            author_id: req.session.user.id
        });
        
        res.status(201).json({ success: true, post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

async function updatePost(req, res) {
    try {
        const { title, content, excerpt } = req.body;
        const post = await PostModel.getById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        if (post.author_id !== req.session.user.id && req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const updatedPost = await PostModel.update(post.id, {
            title: title || post.title,
            content: content || post.content,
            excerpt: excerpt || post.excerpt
        });
        
        res.json({ success: true, post: updatedPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deletePost(req, res) {
    try {
        const post = await PostModel.getById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        if (post.author_id !== req.session.user.id && req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        await PostModel.delete(post.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getPostsAPI(req, res) {
    try {
        const posts = await PostModel.getAll(50);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getPostAPI(req, res) {
    try {
        const post = await PostModel.getBySlug(req.params.slug);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllPosts,
    getPostBySlug,
    getMyPosts,
    createPost,
    updatePost,
    deletePost,
    getPostsAPI,
    getPostAPI
};