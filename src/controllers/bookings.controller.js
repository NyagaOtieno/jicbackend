import { prisma } from "../prisma.js";
import { createBookingSchema } from "../validators/bookings.zod.js";

export async function createBooking(req, res) {
  const tenantId = req.tenantId;
  const body = createBookingSchema.parse(req.body);

  // ensure vehicle belongs to tenant
  const vehicle = await prisma.vehicle.findFirst({ where: { id: body.vehicleId, tenantId } });
  if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });

  const booking = await prisma.booking.create({
    data: {
      tenantId,
      vehicleId: body.vehicleId,
      bookingRef: body.bookingRef,
      bookingFeePaid: body.bookingFeePaid ?? false,
      bookingFeeReceiptNo: body.bookingFeeReceiptNo,
      bookedForDate: body.bookedForDate ? new Date(body.bookedForDate) : null
    }
  });

  res.json({ success: true, data: booking });
}

export async function confirmBooking(req, res) {
  const tenantId = req.tenantId;
  const id = Number(req.params.id);

  const updated = await prisma.booking.updateMany({
    where: { id, tenantId },
    data: { status: "CONFIRMED" }
  });

  if (updated.count === 0) return res.status(404).json({ success: false, message: "Booking not found" });
  res.json({ success: true });
}

export async function listBookings(req, res) {
  const tenantId = req.tenantId;
  const data = await prisma.booking.findMany({
    where: { tenantId },
    include: { vehicle: true },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, data });
}