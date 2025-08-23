import mongoose from "mongoose";

// Connect to MongoDB and propagate errors so caller can handle (e.g., exit on startup failure)
export const connectToDb = async (uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cards_app") => {
  try {
    await mongoose.connect(uri);
    console.log(`connected to MongoDb: ${uri}`);
  } catch (error) {
    console.log(`could not connect to mongoDb: ${error}`);
    throw error;
  }
};
