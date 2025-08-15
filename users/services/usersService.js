import _ from "lodash";
import { generateToken } from "../../auth/providers/jwtProvider.js";
import { comparePassword, generatePassword } from "../helpers/bcrypt.js";
import { createUser, getUserByEmail, deleteUserInDb, getAllUsersFromDb, countUsersInDb, updateUserInDb } from "./usersDataService.js";

export const createNewUser = async (user) => {
  // не позволяем напрямую прислать isAdmin/isBusiness
  const { password, adminCode, ...rest } = user;
  const usersCount = await countUsersInDb();
  const isFirstUser = usersCount === 0;
  const willBeAdmin = isFirstUser || (!!adminCode && adminCode === process.env.ADMIN_REG_CODE);

  const userForDb = {
    ...rest,
    isAdmin: willBeAdmin,
    password: generatePassword(password),
  };

  const newUser = await createUser(userForDb);
  if (!newUser) return null;
  const DTOuser = _.pick(newUser, ["email", "name", "_id", "isAdmin", "isBusiness"]);
  return DTOuser;
};

export const login = async (email, password) => {
  const user = await getUserByEmail(email);
  if (comparePassword(password, user?.password)) {
    return generateToken(user);
  }
  return null;
};

export const deleteUser = async (userId) => {
  const deletedUserId = await deleteUserInDb(userId); // cascade cleanup handled by mongoose hook
  if (!deletedUserId) return null;
  return { userId: deletedUserId };
};

export const getAllUsers = async () => {
  const users = await getAllUsersFromDb();
  if (!users) return null;
  return users.map((u) => _.pick(u, ["_id", "email", "name", "isAdmin", "isBusiness", "createdAt"]));
};

// Update user: only admin or the user himself may update. Non-admin cannot elevate to admin.
export const updateUser = async (requester, userId, updates) => {
  // sanitize disallowed direct fields
  const cleanUpdates = { ...updates };
  delete cleanUpdates._id;
  delete cleanUpdates.createdAt;

  // handle password change if provided
  if (cleanUpdates.password) {
    cleanUpdates.password = generatePassword(cleanUpdates.password);
  }

  // only admin can set isAdmin flag
  if (!requester.isAdmin) {
    if (Object.prototype.hasOwnProperty.call(cleanUpdates, "isAdmin")) {
      delete cleanUpdates.isAdmin;
    }
  }

  const updated = await updateUserInDb(userId, cleanUpdates);
  if (!updated) return null;
  return _.pick(updated, ["_id", "email", "name", "isAdmin", "isBusiness", "createdAt", "address", "image", "phone"]);
};
