import User from "../models/User.js";

//get all
export const getAllUsersFromDb = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const countUsersInDb = async () => {
  try {
    return await User.countDocuments();
  } catch (error) {
    console.log(error);
    return null;
  }
};

//get one by id
export const getUserByIdFromDb = async (id) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    console.log(error);
    return null;
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
    return null;
  }
};

//update -> gets id and new card and return new card
export const updateUserInDb = async (id, newUser) => {
  try {
    const userAfterUpdate = await User.findByIdAndUpdate(id, newUser, {
      new: true,
    });
    return userAfterUpdate;
  } catch (error) {
    console.log(error);
    return null;
  }
};

//delete -> gets id and return id
export const deleteUserInDb = async (id) => {
  try {
    await User.findByIdAndDelete(id);
    return id;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};
