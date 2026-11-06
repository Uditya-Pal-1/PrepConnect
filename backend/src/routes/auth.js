import express from "express";
const router = express.Router();
// Importing the controller functions that contain the core logic
import { registerUser, loginUser, logoutUser, changePassword, requestPasswordReset, resetPassword } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

// @route   POST /api/auth/register
router.post('/register', rateLimit({ limit: 8 }), registerUser);

// @route   POST /api/auth/login
router.post('/login', rateLimit({ limit: 12 }), loginUser);
router.post('/logout', logoutUser);
router.put('/password', auth, changePassword);
router.post('/forgot-password', rateLimit({ limit: 5, windowMs: 60 * 60 * 1000 }), requestPasswordReset);
router.post('/reset-password', rateLimit({ limit: 8 }), resetPassword);

export default router;
