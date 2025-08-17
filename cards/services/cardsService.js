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
      console.log("BizNumber generation failed:", e.message);
      return {
        errors: [
          {
            path: "bizNumber",
            message: e.message || "failed to generate bizNumber",
          },
        ],
      };
    }
  }
  card.user_id = userId;
  const { error, value } = validateCard(card);
  if (error) {
    return {
      errors: error.details.map((d) => ({
        path: d.path.join('.'),
        message: d.message,
      })),
    };
  }
  try {
    const newCard = await createCard(value);
    if (!newCard) {
      return {
        errors: [
          { path: 'general', message: 'failed to persist card (unknown reason)' },
        ],
      };
    }
    return { card: newCard };
  } catch (err) {
    console.log("Card creation DB error:", err?.message || err);
    return {
      errors: [
        { path: 'general', message: err?.message || 'card creation failed' },
      ],
    };
  }
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

    const { error, value } = validateCard(candidate);
    if (error) {
      return {
        errors: error.details.map((d) => ({
          path: d.path.join('.'),
          message: d.message,
        })),
      };
    }

    // Prepare update document (exclude immutable + derived fields)
    const updateDoc = {
      title: value.title,
      subtitle: value.subtitle,
      description: value.description,
      phone: value.phone,
      email: value.email,
      web: value.web,
      image: value.image,
      address: value.address,
    };

    const modifiedCard = await updateCardInDb(id, updateDoc);
    return { card: modifiedCard };
  } catch (err) {
    console.log("Card update error:", err?.errors || err?.message || err);
    return { errors: [{ path: 'general', message: err?.message || 'update failed' }] };
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
