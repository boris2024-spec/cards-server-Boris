import express from "express";
import {
  createNewCard,
  deleteCard,
  getAllCards,
  getCardById,
  updateCard,
  toggleLike,
  changeBizNumber,
  getMyCards,
  blockCard,
  unblockCard,
} from "../services/cardsService.js";
import { auth, checkBlocked, requireAdmin } from "../../auth/services/authService.js";
import { getCardByIdFromDb } from "../services/cardsDataService.js";
import { loadCard, requireOwnerOrAdmin } from "../middlewares/cardPermissions.js";
import { cardToDTO, cardsToDTO } from "../services/dtoService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const isAdmin = req.user?.isAdmin || false;
  const allCards = await getAllCards(isAdmin);
  if (allCards) {
    return res.send(cardsToDTO(allCards, req.user || null));
  }
  res.status(500).send("something went wrong with get all cards");
});

// Deprecated: /cards/my (will be removed later) -> prefer /cards/sandbox
const sendOwnCards = async (req, res) => {
  const user = req.user;
  if (!user.isBusiness) {
    return res.status(403).send("Only Business user can view own cards");
  }
  const cards = await getMyCards(user._id);
  return res.send(cardsToDTO(cards, user));
};

router.get("/my", auth, checkBlocked, async (req, res) => {
  res.setHeader("Warning", "299 - 'GET /cards/my' is deprecated; use /cards/sandbox");
  await sendOwnCards(req, res);
});

router.get("/sandbox", auth, checkBlocked, sendOwnCards);

// Alias for frontend compatibility (/my-cards -> sandbox)
router.get("/my-cards", auth, checkBlocked, sendOwnCards);

router.post("/", auth, checkBlocked, async (req, res) => {
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
  const isAdmin = req.user?.isAdmin || false;
  const card = await getCardById(id, isAdmin);
  if (card) {
    return res.send(cardToDTO(card, req.user || null));
  }
  res.status(404).send("Card not found");
});

router.delete("/:id", auth, checkBlocked, loadCard, requireOwnerOrAdmin, async (req, res) => {
  const idOfDeletedCard = await deleteCard(req.params.id);
  if (idOfDeletedCard) return res.send({ deleted: true, id: idOfDeletedCard });
  res.status(400).send("something went wrong with card delete");
});

router.put("/:id", auth, checkBlocked, loadCard, requireOwnerOrAdmin, async (req, res) => {
  const result = await updateCard(req.params.id, req.body);
  if (result.card) return res.send(cardToDTO(result.card, req.user));
  return res.status(400).send({
    message: "card update failed",
    errors: result.errors || [],
  });
});

router.patch("/:id/like", auth, checkBlocked, async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const result = await toggleLike(id, userId);
  if (result?.notFound) return res.status(404).send("Card not found");
  if (result?.error || !result?.card)
    return res.status(400).send("something went wrong with like toggle");
  res.send(cardToDTO(result.card, req.user));
});

router.patch("/:id", auth, checkBlocked, async (req, res) => {
  // If body is empty, treat as like toggle for compatibility with frontend
  if (!req.body || Object.keys(req.body).length === 0) {
    const { id } = req.params;
    const userId = req.user._id;
    const result = await toggleLike(id, userId);
    if (result?.notFound) return res.status(404).send("Card not found");
    if (result?.error || !result?.card)
      return res.status(400).send("something went wrong with like toggle");
    return res.send(cardToDTO(result.card, req.user));
  }

  // Otherwise, it's a card update - check permissions
  const card = await getCardByIdFromDb(req.params.id);
  if (!card) return res.status(404).send("Card not found");

  const user = req.user;
  if (!user.isAdmin && user._id !== card.user_id) {
    return res.status(403).send("Access denied");
  }

  const result = await updateCard(req.params.id, req.body);
  if (result.card) return res.send(cardToDTO(result.card, req.user));
  return res.status(400).send({
    message: "card update failed",
    errors: result.errors || [],
  });
});

router.patch("/:id/bizNumber", auth, checkBlocked, loadCard, requireOwnerOrAdmin, async (req, res) => {
  const updated = await changeBizNumber(req.params.id);
  if (!updated) return res.status(400).send("could not change bizNumber");
  res.send(cardToDTO(updated, req.user));
});

// Block card (admin only)
router.patch("/:id/block", auth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const result = await blockCard(id);
  if (!result) return res.status(404).send("Card not found");
  res.send(cardToDTO(result, req.user));
});

// Unblock card (admin only)
router.patch("/:id/unblock", auth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const result = await unblockCard(id);
  if (!result) return res.status(404).send("Card not found");
  res.send(cardToDTO(result, req.user));
});

export default router;
