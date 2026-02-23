import { Router } from "express";
import { requireTenant } from "../middleware/tenant.js";
import { requireAuth } from "../middleware/auth.js";
import { createBooking, confirmBooking, listBookings } from "../controllers/bookings.controller.js";

const r = Router();
r.use(requireTenant);
r.use(requireAuth);

r.post("/", createBooking);
r.get("/", listBookings);
r.patch("/:id/confirm", confirmBooking);

export default r;