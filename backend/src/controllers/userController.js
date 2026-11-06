// backend/controllers/userController.js
import User from '../models/User.js';

//Get user profile details
export const getProfile = async (req, res) => {
  try {
    // req.user.id is usually set by auth middleware after JWT verification
    const user = await User.findById(req.user.id).select('-password -passwordResetTokenHash -passwordResetExpiresAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//Update user profile details 
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['fullName', 'skills', 'location', 'bio', 'organizationName', 'organizationDescription', 'websiteUrl'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields dynamically
    Object.keys(updates).forEach((key) => {
      user[key] = updates[key];
    });

    await user.save();
    const safeUser = await User.findById(user._id).select('-password -passwordResetTokenHash -passwordResetExpiresAt');
    res.status(200).json({ message: 'Profile updated successfully', user: safeUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

