import { pool } from "../../config/db";

// create a new booking
const createBooking = async (
  customerId: number,
  vehicleId: number,
  rentStartDate: Date,
  rentEndDate: Date
) => {
    // check if vehicle exists and is available
  const vehicleResult = await pool.query(
    "SELECT * FROM vehicles WHERE id = $1",
    [vehicleId]
  );
// If vehicle not found, throw error
  if (vehicleResult.rows.length === 0) {
    throw new Error("Vehicle not found");
  }
// Get vehicle details from result
  const vehicle = vehicleResult.rows[0];
// If vehicle is not available, throw error
  if (vehicle.availability_status === "booked") {
    throw new Error("Vehicle is not available");
  }
// Validate rental dates 
  const start = new Date(rentStartDate);
  const end = new Date(rentEndDate);
// If end date is before or same as start date, throw error
  if (end <= start) {
    throw new Error("End date must be after start date");
  }
// Calculate number of rental days and total price
  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = days * parseFloat(vehicle.daily_rent_price);
// Begin transaction for booking creation and vehicle status update
  await pool.query("BEGIN");

  try {
    // Insert new booking into bookings table
    const bookingResult = await pool.query(
      "INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [customerId, vehicleId, rentStartDate, rentEndDate, totalPrice, "active"]
    );
// Update vehicle status to booked 
    await pool.query(
      "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
      ["booked", vehicleId]
    );
//  Commit transaction finalizing booking creation
    await pool.query("COMMIT");

// Return booking details along with vehicle info
    const booking = bookingResult.rows[0];
    return {
      ...booking,
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price,
      },
    };
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
};

// get all bookings for a user
const getAllBookings = async (userId: number, userRole: string) => {
  if (userRole === "admin") {
    // Admin sees all bookings WITH customer_id and vehicle details WITH customer details 
    const query = `
      SELECT 
        b.*,
        json_build_object('name', u.name, 'email', u.email) as customer,
        json_build_object('vehicle_name', v.vehicle_name, 'registration_number', v.registration_number) as vehicle
      FROM bookings b 
      JOIN users u ON b.customer_id = u.id 
      JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.id DESC
    `;
    const result = await pool.query(query);
    return result;
  } else {
    // Customer sees only their bookings WITHOUT customer_id
    const query = `
      SELECT 
        b.id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        json_build_object('vehicle_name', v.vehicle_name, 'registration_number', v.registration_number, 'type', v.type) as vehicle
      FROM bookings b 
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
      ORDER BY b.id DESC
    `;
    const result = await pool.query(query, [userId]);
    return result;
  }
};

// update booking status (cancel or return)
const updateBooking = async (
  bookingId: string,
  status: string,
  userId: number,
  userRole: string
) => {
    // fetch booking details
  const bookingResult = await pool.query(
    "SELECT * FROM bookings WHERE id = $1",
    [bookingId]
  );
// If booking not found, throw error
  if (bookingResult.rows.length === 0) {
    throw new Error("Booking not found");
  }
// Get booking details from result
  const booking = bookingResult.rows[0];
// Handle cancellation of booking
  if (status === "cancelled") {
    // Only customers can cancel their own bookings
    if (userRole !== "customer" || booking.customer_id !== userId) {
      throw new Error("You can only cancel your own bookings");
    }
// Only active bookings can be cancelled
    if (booking.status !== "active") {
      throw new Error("Only active bookings can be cancelled");
    }
// Prevent cancellation of bookings that have already started
    const today = new Date();
    const startDate = new Date(booking.rent_start_date);
// If booking has already started, throw error
    if (startDate <= today) {
      throw new Error("Cannot cancel bookings that have started");
    }
// Begin transaction for booking cancellation and vehicle status update
    await pool.query("BEGIN");

    try {
        // Update booking status to cancelled
      const result = await pool.query(
        "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
        ["cancelled", bookingId]
      );
    //   Update vehicle status to available
      await pool.query(
        "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
        ["available", booking.vehicle_id]
      );
    
      await pool.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  } else if (status === "returned") {
    // Only admins can mark bookings as returned
    if (userRole !== "admin") {
      throw new Error("Only admins can mark bookings as returned");
    }
// Only active bookings can be returned
    if (booking.status !== "active") {
      throw new Error("Only active bookings can be returned");
    }
// Begin transaction for booking return and vehicle status update
    await pool.query("BEGIN");

    try {
        // Update booking status to returned
      const result = await pool.query(
        "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
        ["returned", bookingId]
      );
    //   Update vehicle status to available
      await pool.query(
        "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
        ["available", booking.vehicle_id]
      );
      await pool.query("COMMIT");
// Return updated booking details with vehicle availability status
      return {
        ...result.rows[0],
        vehicle: {
          availability_status: "available",
        },
      };
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  } else {
    throw new Error("Invalid status");
  }
};

export const bookingsService = {
  createBooking,
  getAllBookings,
  updateBooking,
};
