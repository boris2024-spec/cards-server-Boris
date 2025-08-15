import express from "express";
import { createNewUser, login, deleteUser, getAllUsers, updateUser } from "../services/usersService.js";
import { auth, requireAdmin } from "../../auth/services/authService.js";

const router = express.Router();

// Registration. Optional adminCode to elevate if matches ADMIN_REG_CODE. First user becomes admin automatically.
router.post("/", async (req, res) => {
  const newUser = req.body;
  const user = await createNewUser(newUser);
  if (user) return res.status(201).send(user);
  res.status(400).send("somehing went wrong with registration");
});

router.post("/login", async (req, res) => {
  const { password, email } = req.body;
  const token = await login(email, password);
  if (token) {
    res.send(token);
  } else {
    res.status(401).send("invalid email or password");
  }
});

// GET all users (admin only)
router.get("/", auth, requireAdmin, async (req, res) => {
  const users = await getAllUsers();
  if (!users) return res.status(500).send("could not get users");
  res.send(users);
});

router.delete("/:id", auth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const requester = req.user;
  if (!requester.isAdmin && requester._id !== id) {
    return res.status(403).send("Only admin or the user himself can delete the user");
  }
  const result = await deleteUser(id);
  if (!result) return res.status(400).send("could not delete user");
  res.send({ deleted: true, ...result, cascade: "handled by hook" });
});

// Update user (self or admin). Admin may update any user. Non-admin may only update self and cannot grant admin.
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const requester = req.user;
  if (!requester.isAdmin && requester._id !== id) {
    return res.status(403).send("Only admin or the user himself can update the user");
  }
  const updated = await updateUser(requester, id, req.body);
  if (!updated) return res.status(400).send("could not update user");
  res.send(updated);
});

export default router;
