import express from "express";
import { createNewUser, login, deleteUser, getAllUsers, updateUser } from "../services/usersService.js";
import { auth, requireAdmin } from "../../auth/services/authService.js";
import { asyncHandler } from "../../middlewares/errorHandler.js";
import { AppError } from "../../middlewares/errorHandler.js";

const router = express.Router();

// Registration. Optional adminCode to elevate if matches ADMIN_REG_CODE. First user becomes admin automatically.
router.post("/", asyncHandler(async (req, res) => {
  const user = await createNewUser(req.body);
  res.status(201).send(user);
}));

router.post("/login", asyncHandler(async (req, res) => {
  const { password, email } = req.body;
  const token = await login(email, password);
  res.send(token);
}));

// GET all users (admin only)
router.get("/", auth, requireAdmin, asyncHandler(async (req, res) => {
  const users = await getAllUsers();
  res.send(users);
}));

router.delete("/:id", auth, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requester = req.user;
  if (!requester.isAdmin && requester._id !== id) {
    throw new AppError("Only admin or the user himself can delete the user", 403);
  }
  const result = await deleteUser(id);
  res.send({ deleted: true, ...result, cascade: "handled by hook" });
}));

// Update user (self or admin). Admin may update any user. Non-admin may only update self and cannot grant admin.
router.put("/:id", auth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requester = req.user;
  if (!requester.isAdmin && requester._id !== id) {
    throw new AppError("Only admin or the user himself can update the user", 403);
  }
  const updated = await updateUser(requester, id, req.body);
  res.send(updated);
}));

export default router;
