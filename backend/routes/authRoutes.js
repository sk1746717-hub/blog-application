const express = require("express");

const {
    registerUser,
    loginUser,
    getUserProfile
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

// Protected user profile route
router.get("/profile", protect, getUserProfile);

module.exports = router;