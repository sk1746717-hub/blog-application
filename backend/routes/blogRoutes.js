const express = require("express");

const {
    createBlog,
    getAllBlogs,
    getBlogById,
    getMyBlogs,
    updateBlog,
    deleteBlog
} = require("../controllers/blogController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getAllBlogs);

// Protected route: get user's own blogs (MUST be defined before /:id)
router.get("/my", protect, getMyBlogs);

// Public route: get single blog by ID
router.get("/:id", getBlogById);

// Protected routes
router.post("/", protect, createBlog);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

module.exports = router;
