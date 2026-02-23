import { prisma } from "../prisma.js";
import { sha256Hex } from "../utils/crypto.js";

export async function requireApiKey(req, res, next) {
  const rawKey = req.headers["x-api-key"]?.toString();
  if (!rawKey) return res.status(401).json({ success: false, message: "Missing X-Api-Key" });

  const keyHash = sha256Hex(rawKey);

  const apiKey = await prisma.apiKey.findFirst({
    where: { keyHash, revokedAt: null },
    include: { insurer: true }
  });

  if (!apiKey) return res.status(401).json({ success: false, message: "Invalid API key" });

  req.insurer = apiKey.insurer;
  req.apiKey = apiKey;

  // update last used (fire-and-forget)
  prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

  next();
}