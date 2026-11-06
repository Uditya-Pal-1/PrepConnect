// backend/routes/user.js
import express from "express";
const router = express.Router();

// Middleware assumed to be defined elsewhere
import { auth } from '../middleware/auth.js';

// Importing the controller functions
import { getProfile, updateProfile } from '../controllers/userController.js';

// @route   GET /api/users/profile
router.get('/profile', auth, getProfile);

// @route   PUT /api/users/profile
router.put('/profile', auth, updateProfile);

export default router; 
