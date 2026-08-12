const Blog = require("../models/Blog");
const mongoose = require("mongoose");

// Helper to format tags cleanly
const parseTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) {
        return tags.map((t) => String(t).trim()).filter(Boolean);
    }
    if (typeof tags === "string") {
        return tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
    return [];
};

// ================================
// 1. Create Blog (Protected)
// ================================
const createBlog = async (req, res) => {
    try {
        const { title, category, content, tags } = req.body;

        // Validation
        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Blog title is required" });
        }
        if (!category || !category.trim()) {
            return res.status(400).json({ message: "Blog category is required" });
        }
        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Blog content is required" });
        }

        const formattedTags = parseTags(tags);

        const blog = await Blog.create({
            title: title.trim(),
            category: category.trim(),
            content,
            tags: formattedTags,
            author: req.user.id
        });

        const populatedBlog = await Blog.findById(blog._id).populate(
            "author",
            "name email role"
        );

        return res.status(201).json(populatedBlog);

    } catch (error) {
        console.error("Create blog error:", error.message);
        return res.status(500).json({ message: "Server error creating blog" });
    }
};

// ================================
// 2. Get All Blogs (Public)
// ================================
const getAllBlogs = async (req, res) => {
    try {
        const { search, category } = req.query;
        const query = {};

        if (category && category.trim() && category !== "All") {
            query.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
        }

        if (search && search.trim()) {
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const searchRegex = new RegExp(escapedSearch, "i");
            query.$or = [
                { title: searchRegex },
                { content: searchRegex },
                { tags: searchRegex }
            ];
        }

        const blogs = await Blog.find(query)
            .sort({ createdAt: -1 })
            .populate("author", "name email role");

        return res.status(200).json(blogs);

    } catch (error) {
        console.error("Get all blogs error:", error.message);
        return res.status(500).json({ message: "Server error fetching blogs" });
    }
};

// ================================
// 3. Get Single Blog by ID (Public)
// ================================
const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid blog ID format" });
        }

        const blog = await Blog.findById(id).populate(
            "author",
            "name email role"
        );

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        return res.status(200).json(blog);

    } catch (error) {
        console.error("Get blog by ID error:", error.message);
        return res.status(500).json({ message: "Server error fetching blog" });
    }
};

// ================================
// 4. Get My Blogs (Protected)
// ================================
const getMyBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ author: req.user.id })
            .sort({ createdAt: -1 })
            .populate("author", "name email role");

        return res.status(200).json(blogs);

    } catch (error) {
        console.error("Get my blogs error:", error.message);
        return res.status(500).json({ message: "Server error fetching user blogs" });
    }
};

// ================================
// 5. Update Blog (Protected - Author Only)
// ================================
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid blog ID format" });
        }

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Check if user is the author
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Not authorized. You can only update your own blogs."
            });
        }

        const { title, category, content, tags } = req.body;

        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({ message: "Title cannot be empty" });
            }
            blog.title = title.trim();
        }

        if (category !== undefined) {
            if (!category.trim()) {
                return res.status(400).json({ message: "Category cannot be empty" });
            }
            blog.category = category.trim();
        }

        if (content !== undefined) {
            if (!content.trim()) {
                return res.status(400).json({ message: "Content cannot be empty" });
            }
            blog.content = content;
        }

        if (tags !== undefined) {
            blog.tags = parseTags(tags);
        }

        await blog.save();

        const updatedBlog = await Blog.findById(blog._id).populate(
            "author",
            "name email role"
        );

        return res.status(200).json(updatedBlog);

    } catch (error) {
        console.error("Update blog error:", error.message);
        return res.status(500).json({ message: "Server error updating blog" });
    }
};

// ================================
// 6. Delete Blog (Protected - Author Only)
// ================================
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid blog ID format" });
        }

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Check if user is the author
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Not authorized. You can only delete your own blogs."
            });
        }

        await blog.deleteOne();

        return res.status(200).json({
            message: "Blog deleted successfully"
        });

    } catch (error) {
        console.error("Delete blog error:", error.message);
        return res.status(500).json({ message: "Server error deleting blog" });
    }
};

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    getMyBlogs,
    updateBlog,
    deleteBlog
};
