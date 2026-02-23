import { Router } from "express";
import { requireTenant } from "../middleware/tenant.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createApiKey, createInsurer, listInsurers } from "../controllers/insurers.controller.js";

const r = Router();

// These are admin functions (you can adjust)
r.use(requireTenant);
r.use(requireAuth);
r.use(requireRole(["ADMIN","MANAGER"]));

r.post("/", createInsurer);
r.get("/", listInsurers);
r.post("/:insurerId/api-keys", createApiKey);

export default r;