import { Router } from "express";
import { requireTenant } from "../middleware/tenant.js";
import { requireAuth } from "../middleware/auth.js";
import { addResults, completeSession, createSession, getSession } from "../controllers/inspections.controller.js";

const r = Router();
r.use(requireTenant);
r.use(requireAuth);

r.post("/sessions", createSession);
r.get("/sessions/:id", getSession);
r.post("/sessions/:id/results", addResults);
r.post("/sessions/:id/complete", completeSession);

export default r;