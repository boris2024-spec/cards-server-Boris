import express from "express";
import {
  createNewCard,
  deleteCard,
  getAllCards,
  getCardById,
  updateCard,
  toggleLike,
  changeBizNumber,
} from "../services/cardsService.js";
import { auth } from "../../auth/services/authService.js";
import { getCardByIdFromDb } from "../services/cardsDataService.js";
import { loadCard, requireOwnerOrAdmin } from "../middlewares/cardPermissions.js";
import { cardToDTO, cardsToDTO } from "../services/dtoService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const allCards = await getAllCards();
  if (allCards) {
    return res.send(cardsToDTO(allCards, req.user || null));
  }
  res.status(500).send("something went wrong with get all cards");
});

router.post("/", auth, async (req, res) => {
  const newCard = req.body;
  const user = req.user;
  if (!user.isBusiness) {
    return res.status(403).send("Only Business user can create cards");
  }
  const result = await createNewCard(newCard, user._id);
  if (result.card) {
    return res.status(201).send(cardToDTO(result.card, user));
  }
  return res.status(400).send({
    message: "card validation failed",
    errors: result.errors || [],
  });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const card = await getCardById(id);
  if (card) {
    return res.send(cardToDTO(card, req.user || null));
  }
  res.status(404).send("Card not found");
});

router.delete("/:id", auth, loadCard, requireOwnerOrAdmin, async (req, res) => {
  const idOfDeletedCard = await deleteCard(req.params.id);
  if (idOfDeletedCard) return res.send({ deleted: true, id: idOfDeletedCard });
  res.status(400).send("something went wrong with card delete");
});

router.put("/:id", auth, loadCard, requireOwnerOrAdmin, async (req, res) => {
  const result = await updateCard(req.params.id, req.body);
  if (result.card) return res.send(cardToDTO(result.card, req.user));
  return res.status(400).send({
    message: "card update failed",
    errors: result.errors || [],
  });
});

router.patch("/:id/like", auth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const updated = await toggleLike(id, userId);
  if (!updated)
    return res.status(400).send("something went wrong with like toggle");
  res.send(cardToDTO(updated, req.user));
});

router.patch("/:id/bizNumber", auth, loadCard, requireOwnerOrAdmin, async (req, res) => {
  const updated = await changeBizNumber(req.params.id);
  if (!updated) return res.status(400).send("could not change bizNumber");
  res.send(cardToDTO(updated, req.user));
});

export default router;
