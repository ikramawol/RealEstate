import { Router, RequestHandler } from "express";
import { protect } from "../controllers/authController";

import {  
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog
} from "../controllers/blogController";

const router = Router();

// Public routes
router.get('/blog', getAllBlogs as RequestHandler);
router.get('/blog/:id', getBlogById as RequestHandler);

// Protected routes (admin only)
router.post('/blog', protect, createBlog as RequestHandler);
router.put('/blog/:id', protect, updateBlog as RequestHandler);
router.delete('/blog/:id', protect, deleteBlog as RequestHandler);

export default router;
