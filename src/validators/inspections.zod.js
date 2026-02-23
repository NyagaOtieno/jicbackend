import { z } from "zod";

export const createSessionSchema = z.object({
  vehicleId: z.number().int(),
  bookingId: z.number().int().optional().nullable(),
  inspectorId: z.number().int().optional().nullable(),
  inspectionType: z.enum([
    "ANNUAL","PRIVATE_OVER_4YRS","SCHOOL","PRE_REGISTRATION","ACCIDENT",
    "CHANGE_OF_PARTICULARS","POLICE","RE_REGISTRATION","SALVAGE_B"
  ]),
  odometerKm: z.number().int().optional().nullable(),
  notes: z.string().max(500).optional().nullable()
});

export const addResultsSchema = z.object({
  results: z.array(z.object({
    itemId: z.number().int(),
    measuredValueNum: z.number().optional().nullable(),
    measuredValueText: z.string().optional().nullable(),
    pass: z.boolean(),
    severity: z.enum(["INFO","MINOR","MAJOR","DANGEROUS"]).optional().default("INFO"),
    remarks: z.string().max(300).optional().nullable()
  })).min(1)
});

export const completeSessionSchema = z.object({
  passThreshold: z.number().int().min(0).max(100).optional()
});