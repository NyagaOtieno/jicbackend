import { randomToken, sha256Hex } from "./crypto.js";

export function generateCertificateNo() {
  // Example: JND-INS-2026-000001 (you can replace with sequence later)
  const ts = new Date();
  const yyyy = ts.getFullYear();
  const rand = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
  return `JND-INS-${yyyy}-${rand}`;
}

export function generateVerificationHash(certificateNo) {
  return sha256Hex(`${certificateNo}:${randomToken(16)}`);
}