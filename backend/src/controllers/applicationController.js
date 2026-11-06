// controllers/applicationController.js
import Application from '../models/Application.js';
import Opportunity from '../models/Opportunity.js';

// Submit an application (volunteer)
export const submitApplication = async (req, res) => {
    try {
        const { opportunityId } = req.body;

        // Check if opportunity exists and is open
        const opportunity = await Opportunity.findById(opportunityId);
        if (!opportunity || opportunity.status === 'close') {
            return res.status(400).json({ message: 'Opportunity not available' });
        }

        // Prevent duplicate applications
        const existingApp = await Application.findOne({
            opportunityId,
            volunteerId: req.user.id,
        });
        if (existingApp) {
            return res.status(400).json({ message: 'You have already applied for this opportunity' });
        }

        const application = new Application({
            opportunityId,
            volunteerId: req.user.id,
        });

        const savedApp = await application.save();
        res.status(201).json(savedApp);
    } catch (err) {
        console.error(err);
        res.status(err.name === 'CastError' || err.code === 11000 ? 400 : 500).json({ message: err.code === 11000 ? 'You have already applied for this opportunity' : 'Could not submit application' });
    }
};

export const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ volunteerId: req.user.id })
            .populate('opportunityId').sort({ createdAt: -1 });
        res.json(applications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Could not load your applications' });
    }
};

// Get all pending applications (NGO)
export const getPendingApplications = async (req, res) => {
    try {
        // Find opportunities created by this NGO
        const ngoOpportunities = await Opportunity.find({ ngoId: req.user.id }).select('_id');
        const opportunityIds = ngoOpportunities.map((o) => o._id);

        // Find applications with status 'pending' for these opportunities
        const applications = await Application.find({
            opportunityId: { $in: opportunityIds },
            status: 'pending',
        }).populate('volunteerId', 'fullName email skills location').populate('opportunityId', 'title').sort({ createdAt: -1 });

        res.json(applications);
    } catch (err) {
        console.error(err);
        res.status(err.name === 'CastError' ? 400 : 500).json({ message: err.name === 'CastError' ? 'Invalid application id' : 'Could not review application' });
    }
};

// Review an application (NGO)
export const reviewApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'accepted' or 'rejected'

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const application = await Application.findById(id).populate('opportunityId');
        if (!application) return res.status(404).json({ message: 'Application not found' });

        // Check that the NGO owns this opportunity
        if (application.opportunityId.ngoId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to review this application' });
        }

        application.status = status;
        const updatedApp = await application.save();
        res.json(updatedApp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getNgoApplications = async (req, res) => {
    try {
        const opportunities = await Opportunity.find({ ngoId: req.user.id }).select('_id');
        const applications = await Application.find({ opportunityId: { $in: opportunities.map((item) => item._id) } })
            .populate('volunteerId', 'fullName email skills location').populate('opportunityId', 'title').sort({ createdAt: -1 });
        res.json(applications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Could not load applications' });
    }
};
