import User from "../models/User.js";
import { AppError } from "../../middlewares/errorHandler.js";

//get all
export const getAllUsersFromDb = async () => {
  try {
    return await User.find();
  } catch (error) {
    console.log(error);
    throw new AppError("Failed to fetch users", 500, error.message);
  }
};

export const countUsersInDb = async () => {
  try {
    return await User.countDocuments();
  } catch (error) {
    console.log(error);
    throw new AppError("Failed to count users", 500, error.message);
  }
};

//get one by id
export const getUserByIdFromDb = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) throw new AppError("User not found", 404);
    return user;
  } catch (error) {
    if (error.name === "CastError") {
      throw new AppError("Invalid user id format", 400);
    }
    if (error instanceof AppError) throw error;
    console.log(error);
    throw new AppError("Failed to get user", 500, error.message);
  }
};

//create
export const createUser = async (user) => {
  try {
    const userForDb = new User(user);
    await userForDb.save();
    return userForDb;
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      // duplicate key (likely email unique)
      throw new AppError("Email already registered", 409);
    }
    if (error.name === "ValidationError") {
      const details = Object.values(error.errors).map((e) => e.message);
      throw new AppError("User validation failed", 400, details);
    }
    throw new AppError("Failed to create user", 500, error.message);
  }
};

//update -> gets id and new card and return new card
export const updateUserInDb = async (id, newUser) => {
  try {
    const userAfterUpdate = await User.findByIdAndUpdate(id, newUser, {
      new: true,
      runValidators: true,
    });
    if (!userAfterUpdate) throw new AppError("User not found", 404);
    return userAfterUpdate;
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      throw new AppError("Invalid user id format", 400);
    }
    if (error.code === 11000) {
      throw new AppError("Email already registered", 409);
    }
    if (error.name === "ValidationError") {
      const details = Object.values(error.errors).map((e) => e.message);
      throw new AppError("User validation failed", 400, details);
    }
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update user", 500, error.message);
  }
};

//delete -> gets id and return id
export const deleteUserInDb = async (id) => {
  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) throw new AppError("User not found", 404);
    return deleted._id.toString();
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      throw new AppError("Invalid user id format", 400);
    }
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to delete user", 500, error.message);
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user; // may be null if not found
  } catch (error) {
    console.log(error);
    throw new AppError("Failed to fetch user by email", 500, error.message);
  }
};
