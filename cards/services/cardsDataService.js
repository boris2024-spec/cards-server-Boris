import Card from "../models/Card.js";

//get all
export const getAllCardsFromDb = async () => {
  try {
    const cards = await Card.find({ isBlocked: { $ne: true } }); // exclude blocked cards
    return cards;
  } catch (error) {
    console.log(error);
    return null;
  }
};

//get all including blocked (admin only)
export const getAllCardsFromDbAdmin = async () => {
  try {
    const cards = await Card.find(); // include all cards for admin
    return cards;
  } catch (error) {
    console.log(error);
    return null;
  }
};

//get one by id
export const getCardByIdFromDb = async (id) => {
  try {
    const card = await Card.findById(id);
    return card;
  } catch (error) {
    console.log(error);
    return null;
  }
};

//create
export const createCard = async (card) => {
  try {
    const cardForDb = new Card(card);
    await cardForDb.save();
    return cardForDb;
  } catch (error) {
    console.log(error);
    return null;
  }
};

//update -> gets id and new card and return new card
export const updateCardInDb = async (id, newCard) => {
  try {
    const cardAfterUpdate = await Card.findByIdAndUpdate(id, newCard, {
      new: true,
    });
    return cardAfterUpdate;
  } catch (error) {
    console.log(error);
    return null;
  }
};

//delete -> gets id and return id
export const deleteCardInDb = async (id) => {
  try {
    await Card.findByIdAndDelete(id);
    return id;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// delete all cards of a user, return deleted count
export const deleteCardsByUserId = async (userId) => {
  try {
    const res = await Card.deleteMany({ user_id: userId });
    return res.deletedCount || 0;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

// remove userId from likes arrays across all cards, return modified count
export const removeLikesOfUser = async (userId) => {
  try {
    const res = await Card.updateMany({ likes: userId }, { $pull: { likes: userId } });
    return res.modifiedCount || 0;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

// get cards by owner user id
export const getCardsByUserIdFromDb = async (userId) => {
  try {
    return await Card.find({ user_id: userId });
  } catch (error) {
    console.log(error);
    return [];
  }
};
