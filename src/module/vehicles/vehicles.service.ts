import { pool } from "../../config/db";
// create a new vehicle 
const createVehicle = async (
  // vehicle schema 
  vehicle_name: string,
  type: string,
  registration_number: string,
  daily_rent_price: number,
  availability_status: string = "available"
) => {
  // validate daily rent price
  if (daily_rent_price <= 0) {
    throw new Error("Daily rent price must be positive");
  }
// check if vehicle with same registration number exists
  const existingVehicle = await pool.query(
    `
    SELECT id FROM vehicles WHERE registration_number = $1
    `,
    [registration_number]
  );
// throw error if vehicle exists
  if (existingVehicle.rows.length > 0) {
    throw new Error("Vehicle with this registration number already exists");
  }
// insert new vehicle into database
  const result = await pool.query(
    "INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );

  return result;
};
// get all vehicles
const getAllVehicle = async () => {
  const result = await pool.query(`
        SELECT * FROM vehicles ORDER BY id ASC
        `);
  return result;
};
// get vehicle by ID
const getVehicleById = async (vehicleId: string) => {
  const result = await pool.query(
    `SELECT * FROM vehicles WHERE id = $1`,
    [vehicleId]
  );
  return result;
};
// update vehicle details
const updateVehicle = async (
  vehicleId: string,
  vehicle_name?: string,
  type?: string,
  registration_number?: string,
  daily_rent_price?: number,
  availability_status?: string
) => {
  // check if vehicle exists
  const existingVehicle = await pool.query(
    ` SELECT * FROM vehicles WHERE id =$1`,
    [vehicleId]
  );
  // throw error if vehicle not found
  if (existingVehicle.rows.length === 0) {
    throw new Error("Vehicle not found");
  }
  // check if registration number is taken by another vehicle
  let existingVehicleResult;
  if (
    registration_number &&
    registration_number !== existingVehicle.rows[0].registration_number
  )
  {
    existingVehicleResult = await pool.query(
      `SELECT id FROM vehicles WHERE registration_number = $1 AND id != $2`,
      [registration_number, vehicleId]
    );
  }
// throw error if registration number taken
  if (existingVehicleResult && existingVehicleResult.rows.length > 0) {
    throw new Error("Vehicle with this registration number already exists");
  }

  if (daily_rent_price !== undefined && daily_rent_price <= 0) {
    throw new Error("Daily rent price must be positive");
  }

  const result = await pool.query(
    `
        UPDATE vehicles SET 
        vehicle_name = COALESCE($1, vehicle_name),
        type = COALESCE($2, type),
        registration_number = COALESCE($3, registration_number),
        daily_rent_price = COALESCE($4, daily_rent_price),
        availability_status = COALESCE($5, availability_status)
        WHERE id = $6
        RETURNING *
        `,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
      vehicleId,
    ]
  );

  return result;
};

const deleteVehicle = async (vehicleId: string) => {
  const vehicle = await pool.query(
    `
        SELECT * FROM vehicles WHERE id = $1
        `,
    [vehicleId]
  );
  if (vehicle.rows.length === 0) {
    throw new Error("Vehicle not found");
  }
  const activeBookings = await pool.query(
    "SELECT id FROM bookings WHERE vehicle_id = $1 AND status = $2",
    [vehicleId, "active"]
  );
  if (activeBookings.rows.length > 0) {
    throw new Error("Cannot delete vehicle with active bookings");
  }
  const result = await pool.query(
    `
        DELETE FROM vehicles WHERE id = $1
        `,
    [vehicleId]
  );
  return result;
};

export const vehiclesService = {
  createVehicle,
  getAllVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
