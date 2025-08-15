import express from "express";
import { createNewUser, login, deleteUser } from "../services/usersService.js";
import { auth } from "../../auth/services/authService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const newUser = req.body;
  const user = await createNewUser(newUser);
  if (user) {
    res.status(201).send(user);
  } else {
    res.status(400).send("somehing went wrong with registration");
  }
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

router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const requester = req.user;
  if (!requester.isAdmin && requester._id !== id) {
    return res.status(403).send("Only admin or the user himself can delete the user");
  }
  const result = await deleteUser(id);
  if (!result) return res.status(400).send("could not delete user");
  res.send({ deleted: true, ...result, cascade: "handled by hook" });
});

export default router;
