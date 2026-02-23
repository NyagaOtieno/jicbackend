import { prisma } from "../prisma.js";
import { addResultsSchema, completeSessionSchema, createSessionSchema } from "../validators/inspections.zod.js";
import { computeScore, riskTier } from "../utils/scoring.js";
import { generateCertificateNo, generateVerificationHash } from "../utils/certificate.js";
import { generateReportPdfUrl } from "../utils/pdf.js";
import { pushToNeuron } from "../utils/neuron.js";

export async function createSession(req, res) {
  const tenantId = req.tenantId;
  const body = createSessionSchema.parse(req.body);

  const vehicle = await prisma.vehicle.findFirst({ where: { id: body.vehicleId, tenantId } });
  if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });

  if (body.bookingId) {
    const booking = await prisma.booking.findFirst({ where: { id: body.bookingId, tenantId, vehicleId: body.vehicleId } });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found for this vehicle" });
  }

  const session = await prisma.inspectionSession.create({
    data: {
      tenantId,
      vehicleId: body.vehicleId,
      bookingId: body.bookingId ?? null,
      inspectorId: body.inspectorId ?? null,
      inspectionType: body.inspectionType,
      odometerKm: body.odometerKm ?? null,
      notes: body.notes ?? null
    },
    include: { vehicle: true }
  });

  res.json({ success: true, data: session });
}

export async function addResults(req, res) {
  const tenantId = req.tenantId;
  const sessionId = Number(req.params.id);
  const body = addResultsSchema.parse(req.body);

  const session = await prisma.inspectionSession.findFirst({ where: { id: sessionId, tenantId } });
  if (!session) return res.status(404).json({ success: false, message: "Session not found" });

  // Upsert results (one per item)
  const ops = body.results.map((r) =>
    prisma.inspectionResult.upsert({
      where: { sessionId_itemId: { sessionId, itemId: r.itemId } },
      update: {
        measuredValueNum: r.measuredValueNum ?? null,
        measuredValueText: r.measuredValueText ?? null,
        pass: r.pass,
        severity: r.severity,
        remarks: r.remarks ?? null
      },
      create: {
        sessionId,
        itemId: r.itemId,
        measuredValueNum: r.measuredValueNum ?? null,
        measuredValueText: r.measuredValueText ?? null,
        pass: r.pass,
        severity: r.severity,
        remarks: r.remarks ?? null
      }
    })
  );

  await prisma.$transaction(ops);

  res.json({ success: true });
}

export async function completeSession(req, res) {
  const tenantId = req.tenantId;
  const sessionId = Number(req.params.id);
  const body = completeSessionSchema.parse(req.body);

  const session = await prisma.inspectionSession.findFirst({
    where: { id: sessionId, tenantId },
    include: {
      vehicle: true,
      results: true
    }
  });

  if (!session) return res.status(404).json({ success: false, message: "Session not found" });
  if (session.status !== "IN_PROGRESS") {
    return res.status(400).json({ success: false, message: "Session already completed" });
  }

  const items = await prisma.inspectionItem.findMany();
  const itemsById = Object.fromEntries(items.map((i) => [i.id, i]));

  const passThreshold = body.passThreshold ?? session.passThreshold;

  const { totalScore, status, defectSeverity } = computeScore({
    results: session.results,
    itemsById,
    passThreshold
  });

  const inspectedAt = new Date();
  const expiresAt = new Date(inspectedAt);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1); // annual validity baseline

  // If passed OR failed, we still create a certificate record for traceability (you can choose to only issue sticker on PASS).
  const certificateNo = generateCertificateNo();
  const verificationHash = generateVerificationHash(certificateNo);
  const reportPdfUrl = await generateReportPdfUrl({ certificateNo });

  const updated = await prisma.inspectionSession.update({
    where: { id: sessionId },
    data: {
      inspectedAt,
      passThreshold,
      totalScore,
      status,
      defectSeverity,
      certificate: {
        create: {
          certificateNo,
          expiresAt,
          reportPdfUrl,
          verificationHash
        }
      }
    },
    include: { certificate: true, vehicle: true }
  });

  // Push condition signal to Neuron (best effort)
  const conditionPayload = {
    registrationNo: updated.vehicle.registrationNo,
    vin: updated.vehicle.vin,
    category: updated.vehicle.category,
    inspectedAt: updated.inspectedAt,
    expiresAt: updated.certificate.expiresAt,
    score: updated.totalScore,
    riskTier: riskTier(updated.totalScore),
    status: updated.status,
    defectSeverity: updated.defectSeverity,
    certificateNo: updated.certificate.certificateNo,
    verificationHash: updated.certificate.verificationHash,
    reportPdfUrl: updated.certificate.reportPdfUrl
  };

  try {
    await pushToNeuron(conditionPayload);
  } catch (e) {
    // Don’t block completion; log for monitoring
    console.warn("Neuron push warning:", e.message);
  }

  res.json({ success: true, data: updated });
}

export async function getSession(req, res) {
  const tenantId = req.tenantId;
  const sessionId = Number(req.params.id);

  const s = await prisma.inspectionSession.findFirst({
    where: { id: sessionId, tenantId },
    include: {
      vehicle: true,
      inspector: { include: { user: true } },
      results: { include: { item: true } },
      certificate: true,
      mediaRefs: true
    }
  });

  if (!s) return res.status(404).json({ success: false, message: "Session not found" });
  res.json({ success: true, data: s });
}