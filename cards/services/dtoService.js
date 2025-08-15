// Functions to transform Card documents to API-friendly DTOs

export const cardToDTO = (card, currentUser = null) => {
    if (!card) return null;
    const plain = card.toObject ? card.toObject() : card;
    const { __v, user_id, ...rest } = plain;
    // include user_id only for owner or admin
    if (currentUser && (currentUser.isAdmin || currentUser._id === user_id)) {
        rest.user_id = user_id;
    }
    // derived fields
    rest.likeCount = Array.isArray(plain.likes) ? plain.likes.length : 0;
    return rest;
};

export const cardsToDTO = (cards, currentUser = null) => {
    if (!Array.isArray(cards)) return [];
    return cards.map((c) => cardToDTO(c, currentUser));
};
