import Application from '../models/Application.js';
import Message from '../models/Message.js';

async function getConversation(applicationId, userId) {
    const application = await Application.findById(applicationId).populate('opportunityId');
    if (!application || application.status !== 'accepted') return null;
    const isVolunteer = application.volunteerId.toString() === userId;
    const isNgo = application.opportunityId.ngoId.toString() === userId;
    return isVolunteer || isNgo ? application : null;
}

export const getMessages = async (req, res) => {
    try {
        const application = await getConversation(req.params.applicationId, req.user.id);
        if (!application) return res.status(404).json({ message: 'Conversation not found or not available yet' });
        const messages = await Message.find({ applicationId: application._id }).populate('senderId', 'fullName role').sort({ createdAt: 1 }).limit(200);
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Could not load conversation' });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
        if (!text || text.length > 2000) return res.status(400).json({ message: 'Message must be between 1 and 2,000 characters' });
        const application = await getConversation(req.params.applicationId, req.user.id);
        if (!application) return res.status(404).json({ message: 'Conversation not found or not available yet' });
        const message = await Message.create({ applicationId: application._id, senderId: req.user.id, text });
        await message.populate('senderId', 'fullName role');
        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Could not send message' });
    }
};
