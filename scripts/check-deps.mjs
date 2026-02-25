// scripts/check-deps.mjs
import fs from "fs";

const paths = [
  "node_modules/jsonwebtoken",
  "node_modules/express",
  "node_modules/dotenv",
  "node_modules/@prisma/client",
];

for (const p of paths) {
  console.log(p, fs.existsSync(p) ? "✅ exists" : "❌ missing");
}

try {
  await import("jsonwebtoken");
  console.log("jsonwebtoken import ✅");
} catch (e) {
  console.error("jsonwebtoken import ❌", e?.message || e);
  process.exit(1);
}