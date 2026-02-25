// src/routes/insurers.routes.js
import express from "express";
import {
  createInsurer,
  listInsurers,
  getInsurer,
  createInsurerApiKey,
} from "../controllers/insurers.controller.js";

const router = express.Router();

router.post("/", createInsurer);
router.get("/", listInsurers);
router.get("/:id", getInsurer);
router.post("/:id/api-keys", createInsurerApiKey);

export default router;