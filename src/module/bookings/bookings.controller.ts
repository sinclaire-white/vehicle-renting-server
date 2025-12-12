import { Request, Response } from "express";
import { bookingsService } from "./bookings.service";

// create a new booking
const createBooking = async (req: any, res: Response) => {
  try {
    // extract data from request body
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } =
      req.body;
    // basic validation
    if (!vehicle_id || !rent_start_date || !rent_end_date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        errors: "All fields are required",
      });
    }
    // only admins can create bookings for other customers
    const customerId =
      req.user.role === "admin" && customer_id ? customer_id : req.user.id;
    // call service to create booking
    const result = await bookingsService.createBooking(
      customerId,
      vehicle_id,
      rent_start_date,
      rent_end_date
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.message,
    });
  }
};

// get all bookings for a user
const getAllBookings = async (req: any, res: Response) => {
  try {
    // call service to get bookings
    const result = await bookingsService.getAllBookings(
      req.user.id,
      req.user.role
    );
    // customize message based on user role
    const message =
      req.user.role === "customer"
        ? "Your bookings retrieved successfully"
        : "Bookings retrieved successfully";

    res.json({
      success: true,
      message: message,
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      errors: error.message,
    });
  }
};

// update booking status (cancel or return)
const updateBooking = async (req: any, res: Response) => {
  try {
    // check if request body has exist
     if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
        errors: "Request body is required",
      });
    }

    // extract data from request body
    const { status } = req.body;

    // basic validation for status
    if (!status || !["cancelled", "returned"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        errors: 'Status must be "cancelled" or "returned"',
      });
    };

    // call service to update booking status
    const result = await bookingsService.updateBooking(
      req.params.bookingId,
      status,
      req.user.id,
      req.user.role
    );

    // customize message based on status
    const message =
      status === "cancelled"
        ? "Booking cancelled successfully"
        : "Booking marked as returned. Vehicle is now available";

    res.json({
      success: true,
      message: message,
      data: result,
    });
  } catch (error: any) {
    const statusCode =
      error.message === "Booking not found"
        ? 404
        : error.message.includes("Only") || error.message.includes("Unauthorized")
        ? 403
        : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message,
      errors: error.message,
    });
  }
};

export const bookingsController = {
  createBooking,
  getAllBookings,
  updateBooking,
};
