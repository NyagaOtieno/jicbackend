import { prisma } from "../prisma.js";
import { z } from "zod";

const addMediaSchema = z.object({
  sessionId: z.number().int(),
  type: z.enum(["PHOTO_FRONT","PHOTO_REAR","PHOTO_ODOMETER","PHOTO_UNDERBODY","VIDEO_CLIP","OTHER"]),
  storageUrl: z.string().url(),
  sha256: z.string().optional().nullable(),
  capturedAt: z.string().datetime().optional().nullable(),
  cctvCameraId: z.string().optional().nullable(),
  cctvStartTs: z.string().datetime().optional().nullable(),
  cctvEndTs: z.string().datetime().optional().nullable()
});

export async function addMediaRef(req, res) {
  const tenantId = req.tenantId;
  const body = addMediaSchema.parse(req.body);

  const session = await prisma.inspectionSession.findFirst({
    where: { id: body.sessionId, tenantId }
  });
  if (!session) return res.status(404).json({ success: false, message: "Session not found" });

  const created = await prisma.mediaRef.create({
    data: {
      sessionId: body.sessionId,
      type: body.type,
      storageUrl: body.storageUrl,
      sha256: body.sha256 ?? null,
      capturedAt: body.capturedAt ? new Date(body.capturedAt) : new Date(),
      cctvCameraId: body.cctvCameraId ?? null,
      cctvStartTs: body.cctvStartTs ? new Date(body.cctvStartTs) : null,
      cctvEndTs: body.cctvEndTs ? new Date(body.cctvEndTs) : null
    }
  });

  res.json({ success: true, data: created });
}

export async function listMediaRefs(req, res) {
  const tenantId = req.tenantId;
  const sessionId = Number(req.query.sessionId);

  const session = await prisma.inspectionSession.findFirst({
    where: { id: sessionId, tenantId }
  });
  if (!session) return res.status(404).json({ success: false, message: "Session not found" });

  const data = await prisma.mediaRef.findMany({
    where: { sessionId },
    orderBy: { capturedAt: "desc" }
  });

  res.json({ success: true, data });
}