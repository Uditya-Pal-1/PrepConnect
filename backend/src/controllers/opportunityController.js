// controllers/opportunityController.js
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import Message from '../models/Message.js';

// Create a new opportunity
export const createOpportunity = async (req, res) => {
    try {
        const { title, description, requiredSkills, duration, location, organization, category } = req.body;
        if (!title?.trim() || !description?.trim()) return res.status(400).json({ message: 'Title and description are required' });
        const newOpportunity = new Opportunity({
            ngoId: req.user.id, // assuming auth middleware sets req.user
            title,
            description,
            requiredSkills,
            duration,
            location,
            organization,
            category
        });
        const savedOpportunity = await newOpportunity.save();
        res.status(201).json(savedOpportunity);
    } catch (err) {
        console.error(err);
        res.status(err.name === 'CastError' ? 400 : 500).json({ message: err.name === 'CastError' ? 'Invalid opportunity id' : 'Could not update opportunity' });
    }
};

// Update an existing opportunity
export const updateOpportunity = async (req, res) => {
    try {
        const { id } = req.params;
        const allowedFields = ['title', 'description', 'requiredSkills', 'duration', 'location', 'organization', 'category', 'status'];
        const updateData = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
        const updatedOpportunity = await Opportunity.findOneAndUpdate({ _id: id, ngoId: req.user.id }, updateData, { new: true, runValidators: true });
        if (!updatedOpportunity) return res.status(404).json({ message: "Opportunity not found" });
        res.json(updatedOpportunity);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteOpportunity = async (req, res) => {
    try {
        const deleted = await Opportunity.findOneAndDelete({ _id: req.params.id, ngoId: req.user.id });
        if (!deleted) return res.status(404).json({ message: 'Opportunity not found' });
        const applicationIds = await Application.find({ opportunityId: deleted._id }).distinct('_id');
        await Message.deleteMany({ applicationId: { $in: applicationIds } });
        await Application.deleteMany({ _id: { $in: applicationIds } });
        res.json({ message: 'Opportunity removed' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Could not remove opportunity' });
    }
};

// Get all opportunities (optionally filter by NGO)
export const getOpportunities = async (req, res) => {
    try {
        const filter = req.user?.role?.toLowerCase() === "ngo" ? { ngoId: req.user.id } : { status: 'open' };
        const opportunities = await Opportunity.find(filter).populate('ngoId', 'fullName organizationName').sort({ createdAt: -1 });
        res.json(opportunities);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
