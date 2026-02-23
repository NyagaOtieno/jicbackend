import { Router } from "express";
import { requireTenant } from "../middleware/tenant.js";
import { requireAuth } from "../middleware/auth.js";
import { createVehicle, listVehicles, getVehicle } from "../controllers/vehicles.controller.js";

const r = Router();

r.use(requireTenant);
r.use(requireAuth);

r.post("/", createVehicle);
r.get("/", listVehicles);
r.get("/:id", getVehicle);

export default r;