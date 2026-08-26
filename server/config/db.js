const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textToLearn";
        await mongoose.connect(mongoURI);

        console.log("MongoDB connected");
    } catch (error) {
        console.error("DB connection failed:", error);
    }
};

module.exports = connectDB;