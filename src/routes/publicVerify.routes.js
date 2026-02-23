import { Router } from "express";
import { requireApiKey } from "../middleware/apiKeyAuth.js";
import { verifyByReg } from "../controllers/publicVerify.controller.js";

const r = Router();

// insurer API key protected
r.get("/verify", requireApiKey, verifyByReg);

export default r;