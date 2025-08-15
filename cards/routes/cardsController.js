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
  const cardResult = await createNewCard(newCard, user._id);

  if (cardResult) {
    res.status(201).send(cardToDTO(cardResult, user));
  } else {
    res.status(400).send("something went wrong with card creation");
  }
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
  const modifiedCard = await updateCard(req.params.id, req.body);
  if (modifiedCard) return res.send(cardToDTO(modifiedCard, req.user));
  res.status(400).send("something went wrong with card edit");
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
