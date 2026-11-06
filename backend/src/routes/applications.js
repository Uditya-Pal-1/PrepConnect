import express from 'express';
import { auth } from '../middleware/auth.js';
import { isVolunteer, isNgo } from '../middleware/role.js';
import { submitApplication, getPendingApplications, reviewApplication, getMyApplications, getNgoApplications } from '../controllers/applicationController.js';

const router = express.Router();
router.post('/', auth, isVolunteer, submitApplication);
router.get('/mine', auth, isVolunteer, getMyApplications);
router.get('/ngo', auth, isNgo, getNgoApplications);
router.get('/pending', auth, isNgo, getPendingApplications);
router.put('/:id', auth, isNgo, reviewApplication);
export default router;
