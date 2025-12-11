import { Router } from "express";
import { bookingsController } from "./bookings.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();
// All booking routes require authentication
router.post("/", authenticate, bookingsController.createBooking);
// Get all bookings for the authenticated user
router.get("/", authenticate, bookingsController.getAllBookings);
// Update a specific booking
router.put("/:bookingId", authenticate, bookingsController.updateBooking);

export const bookingsRoute = router;
