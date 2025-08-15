import { validateCard } from "../validation/cardValidationService.js";
import {
  createCard,
  deleteCardInDb,
  getAllCardsFromDb,
  getCardByIdFromDb,
  updateCardInDb,
} from "./cardsDataService.js";
import { generateBizNumber } from "./bizNumberService.js";
import Card from "../models/Card.js";

//get all
export const getAllCards = async () => {
  const cards = await getAllCardsFromDb();
  return cards;
};

//get one by id
export const getCardById = async (id) => {
  const card = await getCardByIdFromDb(id);
  return card;
};

//create
export const createNewCard = async (card, userId) => {
  // generate a unique bizNumber if not provided
  if (!card.bizNumber) {
    try {
      card.bizNumber = await generateBizNumber();
    } catch (e) {
      console.log(e.message);
      return null;
    }
  }
  card.user_id = userId;
  const { error } = validateCard(card);
  if (error) {
    console.log(error.details[0].message);
    return null;
  }
  const newCard = await createCard(card);
  return newCard;
};

//update
export const updateCard = async (id, newCard) => {
  // fetch existing to protect immutable fields & validate combined result
  const existing = await getCardByIdFromDb(id);
  if (!existing) return null;

  // Prevent changing immutable fields
  if (newCard.user_id && newCard.user_id !== existing.user_id) {
    console.log("Attempt to change user_id blocked");
    delete newCard.user_id;
  }
  if (newCard.bizNumber && newCard.bizNumber !== existing.bizNumber) {
    console.log("Attempt to change bizNumber blocked");
    delete newCard.bizNumber;
  }

  const candidate = {
    ...existing.toObject(),
    ...newCard,
    user_id: existing.user_id,
    bizNumber: existing.bizNumber,
    likes: existing.likes, // keep likes untouched via this route
  };

  const { error } = validateCard(candidate);
  if (error) {
    console.log("Card update validation failed:", error.details[0].message);
    return null;
  }

  const modifiedCard = await updateCardInDb(id, newCard);
  return modifiedCard;
};

//delete
export const deleteCard = async (id) => {
  const idOfDeletedCard = await deleteCardInDb(id);
  return idOfDeletedCard;
};

//toggleLike
export const toggleLike = async (cardId, userId) => {
  try {
    const card = await Card.findById(cardId);
    if (!card) return null;
    const idx = card.likes.findIndex((uid) => uid === userId);
    if (idx === -1) {
      card.likes.push(userId);
    } else {
      card.likes.splice(idx, 1);
    }
    await card.save();
    return card;
  } catch (error) {
    console.log(error);
    return null;
  }
};

//changeBizNumber
export const changeBizNumber = async (cardId) => {
  try {
    const card = await Card.findById(cardId);
    if (!card) return null;
    card.bizNumber = await generateBizNumber();
    await card.save();
    return card;
  } catch (error) {
    console.log(error);
    return null;
  }
};
