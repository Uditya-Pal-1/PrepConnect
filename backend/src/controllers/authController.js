// backend/controllers/authController.js
import User from '../models/User.js'; 
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from 'node:crypto';
import nodemailer from 'nodemailer';

// REGISTER USER
export const registerUser = async (req, res) => {
try {
    const { fullName, email, password, role, skills, location, organizationName, websiteUrl } = req.body;
    if (!fullName?.trim() || !email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 8) {
      return res.status(400).json({ message: 'Name, a valid email, and a password of at least 8 characters are required' });
    }
    if (!['NGO', 'VOLUNTEER'].includes((role || 'VOLUNTEER').toUpperCase())) {
      return res.status(400).json({ message: 'Role must be NGO or VOLUNTEER' });
    }
    if (!process.env.JWT_SECRET) return res.status(503).json({ message: 'Authentication is not configured. Set JWT_SECRET in the backend environment.' });

    // Check if user already exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      role: (role || 'VOLUNTEER').toUpperCase(),
      skills: Array.isArray(skills) ? skills : [],
      location,
      organizationName,
      websiteUrl,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, ver: newUser.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send token in HTTP-only cookie
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    if (error.code === 11000) return res.status(409).json({ message: 'An account with that email already exists' });
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    if (!process.env.JWT_SECRET) return res.status(503).json({ message: 'Authentication is not configured. Set JWT_SECRET in the backend environment.' });

    // Check if user exists
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, ver: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send token in cookie
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Signed out' });
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Enter your current password and a new password of at least 8 characters' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!await bcrypt.compare(currentPassword, user.password)) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = await bcrypt.hash(newPassword, 12);
    user.tokenVersion += 1;
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role, ver: user.tokenVersion }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('accessToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ message: 'Password updated successfully', token });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Could not update your password' });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production' && !process.env.SMTP_HOST) {
      return res.status(503).json({ message: 'Password reset email is temporarily unavailable. Please contact support.' });
    }
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email) return res.status(400).json({ message: 'Enter your account email address' });
    const user = await User.findOne({ email });
    const response = { message: 'If an account exists for that email, password reset instructions are ready.' };
    if (!user) return res.json(response);

    const token = randomBytes(32).toString('hex');
    user.passwordResetTokenHash = createHash('sha256').update(token).digest('hex');
    user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    const resetUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/reset-password?token=${token}`;

    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
      });
      await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: email, subject: 'Reset your SkillBridge password', text: `Use this link within 30 minutes to reset your password: ${resetUrl}` });
    } else if (process.env.NODE_ENV !== 'production') {
      response.developmentResetUrl = resetUrl;
    }
    res.json(response);
  } catch (error) {
    console.error('Password reset request failed:', error);
    res.status(500).json({ message: 'Could not prepare password reset instructions' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'A valid reset link and password of at least 8 characters are required' });
    }
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'This reset link is invalid or expired. Request a new one.' });
    user.password = await bcrypt.hash(password, 12);
    user.tokenVersion += 1;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
    res.json({ message: 'Your password has been reset. You can sign in now.' });
  } catch (error) {
    console.error('Password reset failed:', error);
    res.status(500).json({ message: 'Could not reset your password' });
  }
};

