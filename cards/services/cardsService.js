import { validateCard } from "../validation/cardValidationService.js";
import {
  createCard,
  deleteCardInDb,
  getAllCardsFromDb,
  getAllCardsFromDbAdmin,
  getCardByIdFromDb,
  updateCardInDb,
} from "./cardsDataService.js";
import { getCardsByUserIdFromDb } from "./cardsDataService.js";
import { generateBizNumber } from "./bizNumberService.js";
import Card from "../models/Card.js";

//get all
export const getAllCards = async (isAdmin = false) => {
  const cards = isAdmin ? await getAllCardsFromDbAdmin() : await getAllCardsFromDb();
  return cards;
};

//get cards of the authenticated business user
export const getMyCards = async (userId) => {
  const cards = await getCardsByUserIdFromDb(userId);
  return cards;
};

//get one by id
export const getCardById = async (id, isAdmin = false) => {
  const card = await getCardByIdFromDb(id);
  if (!card) return null;

  // If card is blocked and user is not admin, return null
  if (card.isBlocked && !isAdmin) {
    return null;
  }

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

  // Set default image if not provided
  if (!card.image || !card.image.url) {
    card.image = {
      url: "https://wallpaperbat.com/img/451048-free-wallpaper-free-photography-wallpaper-japanese-folk-culture-2-wallpaper-1366x768.jpg",
      alt: card.image?.alt || "Default image"
    };
  }

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
        url: newCard.image?.url || existing.image?.url || "https://wallpaperbat.com/img/451048-free-wallpaper-free-photography-wallpaper-japanese-folk-culture-2-wallpaper-1366x768.jpg",
        alt: newCard.image?.alt || existing.image?.alt || "Default image",
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
    // Get only the likes field to check existence
    const existing = await Card.findById(cardId).select("_id likes");
    if (!existing) return { notFound: true };

    const hasLike = existing.likes?.includes(userId);
    const update = hasLike
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } }; // addToSet prevents duplicates

    const updated = await Card.findByIdAndUpdate(cardId, update, { new: true });
    return { card: updated };
  } catch (error) {
    console.log("toggleLike error", error);
    return { error };
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

//blockCard
export const blockCard = async (cardId) => {
  try {
    const updated = await Card.findByIdAndUpdate(
      cardId,
      { isBlocked: true },
      { new: true }
    );
    return updated;
  } catch (error) {
    console.log("blockCard error:", error);
    return null;
  }
};

//unblockCard
export const unblockCard = async (cardId) => {
  try {
    const updated = await Card.findByIdAndUpdate(
      cardId,
      { isBlocked: false },
      { new: true }
    );
    return updated;
  } catch (error) {
    console.log("unblockCard error:", error);
    return null;
  }
};
