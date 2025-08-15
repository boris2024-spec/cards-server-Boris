import _ from "lodash";
import { generateToken } from "../../auth/providers/jwtProvider.js";
import { comparePassword, generatePassword } from "../helpers/bcrypt.js";
import { createUser, getUserByEmail, deleteUserInDb } from "./usersDataService.js";
import { deleteCardsByUserId, removeLikesOfUser } from "../../cards/services/cardsDataService.js";

export const createNewUser = async (user) => {
  let hashPass = generatePassword(user.password);
  user.password = hashPass;
  const newUser = await createUser(user);
  if (!newUser) {
    return null;
  }
  const DTOuser = _.pick(newUser, ["email", "name", "_id"]);
  return DTOuser;
};

export const login = async (email, password) => {
  const user = await getUserByEmail(email);
  if (comparePassword(password, user?.password)) {
    return generateToken(user);
  }
  return null;
};

export const deleteUserCascade = async (userId) => {
  // first delete cards owned by user
  const deletedCards = await deleteCardsByUserId(userId);
  // then remove likes
  const removedLikes = await removeLikesOfUser(userId);
  // finally delete user
  const deletedUserId = await deleteUserInDb(userId);
  if (!deletedUserId) return null;
  return { userId: deletedUserId, deletedCards, removedLikes };
};
