// src/controllers/insurers.controller.js
import crypto from "crypto";
import prisma from "../prisma.js";

export async function createInsurer(req, res) {
  try {
    const { name, contactPerson, email, phone, status } = req.body || {};
    if (!name) return res.status(400).json({ success: false, message: "name is required" });

    const insurer = await prisma.insurer.create({
      data: {
        name: String(name).trim(),
        contactPerson: contactPerson ? String(contactPerson).trim() : null,
        email: email ? String(email).trim() : null,
        phone: phone ? String(phone).trim() : null,
        status: status || "ACTIVE",
      },
    });

    return res.status(201).json({ success: true, insurer });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create insurer", detail: String(err?.message || err) });
  }
}

export async function listInsurers(req, res) {
  try {
    const insurers = await prisma.insurer.findMany({ orderBy: { id: "desc" } });
    return res.json({ success: true, insurers });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to list insurers", detail: String(err?.message || err) });
  }
}

export async function getInsurer(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: "Invalid id" });

    const insurer = await prisma.insurer.findUnique({ where: { id } });
    if (!insurer) return res.status(404).json({ success: false, message: "Insurer not found" });

    return res.json({ success: true, insurer });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to get insurer", detail: String(err?.message || err) });
  }
}

// Optional: create an API key (stores only hash in DB)
export async function createInsurerApiKey(req, res) {
  try {
    const insurerId = Number(req.params.id);
    if (!Number.isFinite(insurerId)) return res.status(400).json({ success: false, message: "Invalid insurer id" });

    const { name = "default", scopes = {} } = req.body || {};

    // raw key shown once
    const rawKey = `jic_${crypto.randomBytes(24).toString("hex")}`;
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const apiKey = await prisma.apiKey.create({
      data: {
        insurerId,
        name: String(name),
        keyHash,
        scopes,
      },
    });

    return res.status(201).json({ success: true, apiKey: { id: apiKey.id, name: apiKey.name, createdAt: apiKey.createdAt }, rawKey });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create api key", detail: String(err?.message || err) });
  }
}