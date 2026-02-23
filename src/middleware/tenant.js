export function requireTenant(req, res, next) {
  const tenantId = Number(req.headers["x-tenant-id"]);
  if (!tenantId || !Number.isFinite(tenantId)) {
    return res.status(400).json({ success: false, message: "Missing X-Tenant-Id header" });
  }
  req.tenantId = tenantId;
  if (req.audit) req.audit.tenantId = tenantId;
  next();
}