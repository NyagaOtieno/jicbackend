import { z } from "zod";

export const createVehicleSchema = z.object({
  registrationNo: z.string().min(3),
  vin: z.string().optional().nullable(),
  engineNo: z.string().optional().nullable(),
  make: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  yearOfMfg: z.number().int().optional().nullable(),
  category: z.enum(["PRIVATE","PSV","COMMERCIAL","SCHOOL","DRIVING_SCHOOL","GOVERNMENT","TRAILER","MOTORCYCLE","THREE_WHEELER"]),
  tareWeightKg: z.number().int().optional().nullable(),
  engineCc: z.number().int().optional().nullable(),
  evBatteryKwh: z.number().int().optional().nullable(),
  telematicsImei: z.string().optional().nullable(),
  speedGovernorSerial: z.string().optional().nullable(),
  owner: z.object({
    fullName: z.string().min(2),
    idNo: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    address: z.string().optional().nullable()
  }).optional().nullable()
});