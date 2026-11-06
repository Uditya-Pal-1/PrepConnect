// backend/config/db.js
// database setup here
// backend/config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.warn("MONGO_URI is not set. The API is running without database-backed features.");
        return;
    }
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error('MongoDB is unavailable. Database-backed API requests will fail until it is started.');
    }
};
