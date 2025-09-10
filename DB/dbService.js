import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
// Connect to MongoDB and propagate errors so caller can handle (e.g., exit on startup failure)
export const connectToDb = async (uri = process.env.MONGODB_URI) => {
  try {
    await mongoose.connect(uri);
    console.log(`connected to MongoDb: ${uri}`);
  } catch (error) {
    console.log(`could not connect to mongoDb: ${error}`);
    throw error;
  }
};
