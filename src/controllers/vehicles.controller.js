import { prisma } from "../prisma.js";
import { createVehicleSchema } from "../validators/vehicles.zod.js";

export async function createVehicle(req, res) {
  const tenantId = req.tenantId;
  const body = createVehicleSchema.parse(req.body);

  const created = await prisma.vehicle.create({
    data: {
      tenantId,
      registrationNo: body.registrationNo,
      vin: body.vin,
      engineNo: body.engineNo,
      make: body.make,
      model: body.model,
      yearOfMfg: body.yearOfMfg,
      category: body.category,
      tareWeightKg: body.tareWeightKg,
      engineCc: body.engineCc,
      evBatteryKwh: body.evBatteryKwh,
      telematicsImei: body.telematicsImei,
      speedGovernorSerial: body.speedGovernorSerial,
      owner: body.owner
        ? { create: { ...body.owner } }
        : undefined
    },
    include: { owner: true }
  });

  res.json({ success: true, data: created });
}

export async function listVehicles(req, res) {
  const tenantId = req.tenantId;
  const search = (req.query.search || "").toString().trim();
  const category = (req.query.category || "").toString().trim();

  const where = {
    tenantId,
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { registrationNo: { contains: search, mode: "insensitive" } },
            { vin: { contains: search, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const data = await prisma.vehicle.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { owner: true }
  });

  res.json({ success: true, data });
}

export async function getVehicle(req, res) {
  const tenantId = req.tenantId;
  const id = Number(req.params.id);

  const v = await prisma.vehicle.findFirst({
    where: { id, tenantId },
    include: { owner: true, sessions: { orderBy: { createdAt: "desc" }, take: 10 } }
  });

  if (!v) return res.status(404).json({ success: false, message: "Vehicle not found" });
  res.json({ success: true, data: v });
}