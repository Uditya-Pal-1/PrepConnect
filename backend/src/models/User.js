// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: { type: String, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: String,
    tokenVersion: { type: Number, default: 0 },
    passwordResetTokenHash: String,
    passwordResetExpiresAt: Date,
    provider: { type: String, default: "local" },
    providerId: String,
    role: { type: String, enum: ["NGO", "VOLUNTEER"], default: "VOLUNTEER" },
    skills: { type: [String], default: [] },
    location: String,
    bio: String,
    organizationName: String,
    organizationDescription: String,
    websiteUrl: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

userSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model("User", userSchema);
