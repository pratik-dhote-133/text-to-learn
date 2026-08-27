const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error("MONGODB_URI environment variable is not defined");
        }

        await mongoose.connect(mongoURI);

        console.log("MongoDB connected");
    } catch (error) {
        console.error("DB connection failed:", error);
    }
};

module.exports = connectDB;