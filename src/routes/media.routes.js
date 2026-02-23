import { Router } from "express";
import { requireTenant } from "../middleware/tenant.js";
import { requireAuth } from "../middleware/auth.js";
import { addMediaRef, listMediaRefs } from "../controllers/media.controller.js";

const r = Router();
r.use(requireTenant);
r.use(requireAuth);

r.post("/", addMediaRef);
r.get("/", listMediaRefs);

export default r;