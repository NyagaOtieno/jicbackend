import crypto from "crypto";

export function sha256Hex(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

export function randomToken(len = 32) {
  return crypto.randomBytes(len).toString("hex");
}