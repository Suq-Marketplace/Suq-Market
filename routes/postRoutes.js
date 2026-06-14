const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', postController.getAllPosts);

router.get('/:slug', postController.getPostBySlug);

router.get('/api/posts', postController.getPostsAPI);

router.get('/api/posts/:slug', postController.getPostAPI);

router.get('/api/my-posts', isAuthenticated, postController.getMyPosts);

router.post('/api/posts', isAuthenticated, postController.createPost);

router.put('/api/posts/:id', isAuthenticated, postController.updatePost);

router.delete('/api/posts/:id', isAuthenticated, postController.deletePost);

module.exports = router;