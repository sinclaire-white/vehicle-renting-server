import bcrypt from "bcryptjs";
import { pool } from "../../config/db";

// Get all users
const getAllusers = async () => {
  const result = await pool.query(
    `
        SELECT id, name, email, phone, role FROM customers ORDER BY id ASC;
        `
  );
  return result.rows;
};

// update user
const updateUser = async (
  userId: string,
  userData: any,
  requestUserId: string,
  requestUserRole: string
) => {
  // check if user exists
  const result = await pool.query(
    `
        SELECT * FROM customers WHERE id = $1
    `,
    [userId]
  );
  if (result.rows.length === 0) {
    throw new Error("User not found");
  }
  // check if user is admin or the user himself
  if (requestUserId !== userId && requestUserRole !== "admin") {
    throw new Error("Unauthorized to update this user");
  }

  // user data to be updated
  const { name, email, password, phone, role } = userData;

  // check if name is already taken
  if (email) {
    const emailLowercase = email.toLowerCase();
    const emailCheck = await pool.query(
      `
            SELECT * FROM customers WHERE email = $1 AND id != $2
        `,
      [emailLowercase, userId]
    );
    if (emailCheck.rows.length > 0) {
      throw new Error("Email already in use");
    }
  }

  if (role && requestUserRole !== "admin") {
    throw new Error("Only admin can update role");
  }
  // hash password if provided
  let hashedPassword;
  if (password) {
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // Update the user in the database
  const updateResult = await pool.query(
    "UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone), password = COALESCE($4, password), role = COALESCE($5, role) WHERE id = $6 RETURNING id, name, email, phone, role",
    [name, email?.toLowerCase(), phone, hashedPassword, role, userId]
  );
  return updateResult;
};
// delete user
const deleteUser = async (
  userId: string,
  requestUserId: string,
  requestUserRole: string
) => {
  // check if user exists
  const result = await pool.query(
    `
        SELECT * FROM customers WHERE id = $1
    `,
    [userId]
  );
  if (result.rows.length === 0) {
    throw new Error("User not found");
  }
  // check if user is admin or the user himself
  if (requestUserId !== userId && requestUserRole !== "admin") {
    throw new Error("Unauthorized to delete this user");
  }

  // check if user has active bookings
  const activeBookings = await pool.query(
    `SELECT id FROM bookings WHERE customer_id = $1 AND status = $2`,
    [userId, "active"]
  );
  // If active bookings exist, prevent deletion
  if (activeBookings.rows.length > 0) {
    throw new Error("Cannot delete user with active bookings");
  }

  const deleteResult = await pool.query(
    `
        DELETE FROM customers WHERE id = $1
    `,
    [userId]
  );
  return deleteResult;
};

export const usersService = {
  getAllusers,
  updateUser,
  deleteUser,
};
