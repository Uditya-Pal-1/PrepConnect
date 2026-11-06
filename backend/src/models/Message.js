// models/Application.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
