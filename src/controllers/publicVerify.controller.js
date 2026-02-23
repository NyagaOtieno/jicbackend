import { prisma } from "../prisma.js";
import { riskTier } from "../utils/scoring.js";

export async function verifyByReg(req, res) {
  const reg = (req.query.reg || "").toString().trim();
  if (!reg) return res.status(400).json({ success: false, message: "Missing reg" });

  const vehicle = await prisma.vehicle.findFirst({
    where: { registrationNo: reg },
    include: {
      sessions: {
        where: { status: { in: ["PASSED","FAILED"] } },
        orderBy: { inspectedAt: "desc" },
        take: 1,
        include: { certificate: true }
      }
    }
  });

  if (!vehicle || vehicle.sessions.length === 0) {
    return res.json({ success: true, data: { found: false } });
  }

  const s = vehicle.sessions[0];
  const c = s.certificate;

  const now = new Date();
  const expired = c?.expiresAt ? c.expiresAt < now : true;

  res.json({
    success: true,
    data: {
      found: true,
      registrationNo: vehicle.registrationNo,
      vin: vehicle.vin,
      category: vehicle.category,
      status: s.status,
      inspectedAt: s.inspectedAt,
      expiresAt: c?.expiresAt ?? null,
      valid: !expired && s.status === "PASSED",
      score: s.totalScore,
      riskTier: riskTier(s.totalScore),
      defectSeverity: s.defectSeverity,
      certificateNo: c?.certificateNo ?? null,
      verificationHash: c?.verificationHash ?? null,
      reportPdfUrl: c?.reportPdfUrl ?? null
    }
  });
}