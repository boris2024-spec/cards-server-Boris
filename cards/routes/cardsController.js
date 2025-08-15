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

router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  //בדיקה אם המשתמש הוא אדמין או הבעלים של הכרטיס?
  const card = await getCardByIdFromDb(id);

  if (!user.isAdmin && card?.user_id !== user._id) {
    return res
      .status(403)
      .send("Only Admin user Or owner of card can delete it");
  }

  const idOfDeletedCard = await deleteCard(id);
  if (idOfDeletedCard) return res.send({ deleted: true, id: idOfDeletedCard });
  res.status(400).send("something went wrong with card delete");
});

router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const newCard = req.body;
  // only owner or admin can edit
  const card = await getCardByIdFromDb(id);
  if (!card) return res.status(404).send("Card not found");
  const user = req.user;
  if (!user.isAdmin && card.user_id !== user._id) {
    return res
      .status(403)
      .send("Only Admin user Or owner of card can edit it");
  }
  const modifiedCard = await updateCard(id, newCard);
  if (modifiedCard) return res.send(cardToDTO(modifiedCard, user));
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

router.patch("/:id/bizNumber", auth, async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const card = await getCardByIdFromDb(id);
  if (!card) return res.status(404).send("Card not found");
  if (!user.isAdmin && card.user_id !== user._id) {
    return res
      .status(403)
      .send("Only Admin user Or owner of card can change bizNumber");
  }
  const updated = await changeBizNumber(id);
  if (!updated) return res.status(400).send("could not change bizNumber");
  res.send(cardToDTO(updated, user));
});

export default router;
