import _ from "lodash";
import { generateToken } from "../../auth/providers/jwtProvider.js";
import { comparePassword, generatePassword } from "../helpers/bcrypt.js";
import { createUser, getUserByEmail, deleteUserInDb, getAllUsersFromDb, countUsersInDb, updateUserInDb, getUserByIdFromDb } from "./usersDataService.js";
import { AppError } from "../../middlewares/errorHandler.js";
import { checkLoginAttempts, handleFailedLogin, handleSuccessfulLogin, resetLoginAttempts } from "./loginAttemptService.js";

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

  const newUser = await createUser(userForDb); // createUser бросит ошибку при проблеме
  const DTOuser = _.pick(newUser, ["email", "name", "_id", "isAdmin", "isBusiness", "isBlocked"]);
  return DTOuser;
};

export const login = async (email, password) => {
  // Проверяем блокировку по попыткам входа
  const loginCheck = await checkLoginAttempts(email);

  if (loginCheck.isBlocked) {
    throw new AppError(`Account is blocked due to multiple failed login attempts. Try again in ${loginCheck.timeLeft} hours`, 423);
  }

  const user = await getUserByEmail(email);
  if (!user) {
    await handleFailedLogin(email);
    throw new AppError("Invalid email or password", 401);
  }

  if (user.isBlocked) {
    throw new AppError("User is blocked", 403);
  }

  if (!comparePassword(password, user?.password)) {
    const attemptResult = await handleFailedLogin(email);

    if (attemptResult.isBlocked) {
      throw new AppError("Account is blocked for 24 hours due to multiple failed login attempts", 423);
    }

    throw new AppError(`Invalid email or password. ${attemptResult.remainingAttempts} attempts remaining`, 401);
  }

  // Успешный вход - очищаем попытки
  await handleSuccessfulLogin(email);

  const token = generateToken(user);
  console.log("my token"); // Выводим только "my token" в консоль для безопасности
  return token;
};

export const deleteUser = async (userId) => {
  const deletedUserId = await deleteUserInDb(userId); // deleteUserInDb бросит ошибку если не найден
  return { userId: deletedUserId };
};

export const getAllUsers = async () => {
  const users = await getAllUsersFromDb();
  return users.map((u) => _.pick(u, ["_id", "email", "name", "isAdmin", "isBusiness", "isBlocked", "createdAt"]));
};

// Get single user (self or admin)
export const getUserById = async (requester, userId) => {
  if (!requester.isAdmin && requester._id !== userId) {
    throw new AppError("Only admin or the user himself can view the user", 403);
  }
  const user = await getUserByIdFromDb(userId); // throws 404 if not found / 400 if bad id
  return _.pick(user, ["_id", "email", "name", "isAdmin", "isBusiness", "isBlocked", "createdAt", "address", "image", "phone"]);
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
    if (Object.prototype.hasOwnProperty.call(cleanUpdates, "isBlocked")) {
      delete cleanUpdates.isBlocked;
    }
  }

  const updated = await updateUserInDb(userId, cleanUpdates); // бросит 404 при отсутствии
  return _.pick(updated, ["_id", "email", "name", "isAdmin", "isBusiness", "isBlocked", "createdAt", "address", "image", "phone"]);
};

// Block user (admin only)
export const blockUser = async (userId) => {
  const updated = await updateUserInDb(userId, { isBlocked: true });
  return _.pick(updated, ["_id", "email", "name", "isAdmin", "isBusiness", "isBlocked", "createdAt"]);
};

// Unblock user (admin only)
export const unblockUser = async (userId) => {
  const updated = await updateUserInDb(userId, { isBlocked: false });
  return _.pick(updated, ["_id", "email", "name", "isAdmin", "isBusiness", "isBlocked", "createdAt"]);
};

// Reset login attempts (admin only)
export const resetUserLoginAttempts = async (email) => {
  await resetLoginAttempts(email);
  return { message: "Login attempts reset successfully", email };
};
