import express from 'express';
import { auth } from '../middleware/auth.js';
import { getMessages, sendMessage } from '../controllers/messageController.js';

const router = express.Router();
router.get('/:applicationId', auth, getMessages);
router.post('/:applicationId', auth, sendMessage);
export default router;
