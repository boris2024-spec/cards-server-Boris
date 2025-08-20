import { verifyToken } from "../providers/jwtProvider.js";

// Извлекаем JWT из нескольких возможных мест (x-auth-token или Authorization: Bearer <token>)
const extractToken = (req) => {
  const direct = req.header("x-auth-token");
  if (direct) return direct.trim();
  const authHeader = req.header("authorization");
  if (!authHeader) return null;
  // Поддерживаем формат "Bearer <token>"
  const [scheme, value] = authHeader.split(" ");
  if (scheme && /^Bearer$/i.test(scheme) && value) return value.trim();
  // Если заголовок без схемы – тоже пробуем
  if (!scheme && authHeader) return authHeader.trim();
  return null;
};

export const auth = (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).send("Authentication Error: Please Login");
  }
  const userInfo = verifyToken(token);
  if (!userInfo) {
    return res.status(401).send("Authentication Error: Unauthorize user");
  }

  req.user = userInfo;
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).send("Access denied: admin only");
  }
  next();
};

export const checkBlocked = (req, res, next) => {
  if (req.user?.isBlocked) {
    return res.status(403).send("Access denied: user is blocked");
  }
  next();
};
