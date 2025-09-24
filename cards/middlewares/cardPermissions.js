import { getCardByIdFromDb } from "../services/cardsDataService.js";

// Middleware: loads the card and checks if the user is an admin or the owner
// Usage: router.use('/:id', auth, loadCard, requireOwnerOrAdmin)
// Here we make two separate functions for flexibility.

export const loadCard = async (req, res, next) => {
    const { id } = req.params;
    const card = await getCardByIdFromDb(id);
    if (!card) return res.status(404).send("Card not found");
    req.card = card;
    next();
};

export const requireOwnerOrAdmin = (req, res, next) => {
    const user = req.user;
    const card = req.card;
    if (!user?.isAdmin && card.user_id !== user?._id) {
        return res.status(403).send("Only Admin user Or owner of card can perform this action");
    }
    next();
};
