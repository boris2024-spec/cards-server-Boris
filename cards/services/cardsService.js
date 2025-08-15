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
export const updateCard = async (id, newCard = {}) => {
  try {
    const existing = await getCardByIdFromDb(id);
    if (!existing) return null;

    // Remove forbidden / immutable fields from incoming object
    delete newCard._id;
    delete newCard.user_id;
    delete newCard.bizNumber; // change via dedicated endpoint
    delete newCard.likes; // change via like toggle
    delete newCard.__v;
    delete newCard.createdAt;
    delete newCard.updatedAt;

    // Build merged candidate ONLY with fields defined in validation schema
    const candidate = {
      title: newCard.title ?? existing.title,
      subtitle: newCard.subtitle ?? existing.subtitle,
      description: newCard.description ?? existing.description,
      phone: newCard.phone ?? existing.phone,
      email: newCard.email ?? existing.email,
      web: newCard.web ?? existing.web,
      image: {
        url: newCard.image?.url ?? existing.image?.url ?? "",
        alt: newCard.image?.alt ?? existing.image?.alt ?? "",
      },
      address: {
        state: newCard.address?.state ?? existing.address?.state ?? "",
        country: newCard.address?.country ?? existing.address?.country,
        city: newCard.address?.city ?? existing.address?.city,
        street: newCard.address?.street ?? existing.address?.street,
        houseNumber: newCard.address?.houseNumber ?? existing.address?.houseNumber,
        zip: newCard.address?.zip ?? existing.address?.zip,
      },
      bizNumber: existing.bizNumber, // immutable here
      user_id: existing.user_id, // immutable
    };

    const { error } = validateCard(candidate);
    if (error) {
      console.log("Card update validation failed:", error.details[0].message);
      return null;
    }

    // Prepare update document (exclude immutable + derived fields)
    const updateDoc = {
      title: candidate.title,
      subtitle: candidate.subtitle,
      description: candidate.description,
      phone: candidate.phone,
      email: candidate.email,
      web: candidate.web,
      image: candidate.image,
      address: candidate.address,
    };

    const modifiedCard = await updateCardInDb(id, updateDoc);
    return modifiedCard;
  } catch (err) {
    console.log("Card update error:", err?.errors || err?.message || err);
    return null;
  }
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
