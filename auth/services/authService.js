import { verifyToken } from "../providers/jwtProvider.js";

// Extract JWT from multiple possible locations (x-auth-token or Authorization: Bearer <token>)
const extractToken = (req) => {
  const direct = req.header("x-auth-token");
  if (direct) return direct.trim();

  const authHeader = req.header("authorization");
  if (!authHeader) return null;

  // Support "Bearer <token>" format
  const parts = authHeader.split(" ");
  if (parts.length === 2) {
    const [scheme, token] = parts;
    if (/^Bearer$/i.test(scheme)) return token.trim();
  }

  // Fallback: treat entire header as token (for legacy support)
  return authHeader.trim();
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
