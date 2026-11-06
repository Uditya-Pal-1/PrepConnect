// models/Opportunity.js
import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema({
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    requiredSkills: { type: [String], default: [] },
    duration: String,
    location: String,
    organization: String,
    category: String,
    status: { type: String, enum: ["open", "close"], default: "open" },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Opportunity", opportunitySchema);
