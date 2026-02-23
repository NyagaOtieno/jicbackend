import { z } from "zod";

export const createBookingSchema = z.object({
  vehicleId: z.number().int(),
  bookingRef: z.string().optional().nullable(),
  bookingFeePaid: z.boolean().optional(),
  bookingFeeReceiptNo: z.string().optional().nullable(),
  bookedForDate: z.string().datetime().optional().nullable()
});