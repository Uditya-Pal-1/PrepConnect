import express from 'express';
import { auth } from '../middleware/auth.js';
import { isNgo } from '../middleware/role.js';
import { createOpportunity, updateOpportunity, deleteOpportunity, getOpportunities } from '../controllers/opportunityController.js';

const router = express.Router();
router.get('/', getOpportunities);
router.get('/mine', auth, isNgo, getOpportunities);
router.post('/', auth, isNgo, createOpportunity);
router.put('/:id', auth, isNgo, updateOpportunity);
router.delete('/:id', auth, isNgo, deleteOpportunity);
export default router;
