import { getCardByIdFromDb } from "../services/cardsDataService.js";

// Middleware: загружает карточку и проверяет что пользователь админ или владелец
// Использование: router.use('/:id', auth, loadCard, requireOwnerOrAdmin)
// Но здесь делаем две отдельные функции для гибкости.

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
