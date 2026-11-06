import express from 'express';
import { createContactMessage } from '../controllers/contactController.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = express.Router();
router.post('/', rateLimit({ limit: 5 }), createContactMessage);
export default router;
