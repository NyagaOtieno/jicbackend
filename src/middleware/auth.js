import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev");
    req.user = payload;
    if (req.audit) req.audit.actorUserId = payload.userId || null;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}