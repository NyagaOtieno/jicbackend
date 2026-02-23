export function auditMiddleware(req, res, next) {
  req.audit = {
    ip: req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress,
    userAgent: req.headers["user-agent"]?.toString() || null,
    actorUserId: null,
    tenantId: null
  };
  next();
}