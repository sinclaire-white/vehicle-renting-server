import { Request, Response } from "express";
import { vehiclesService } from "./vehicles.service";

// Create a new vehicle
const createVehicle = async (req: Request, res: Response) => {
  try {
    // Extract data from request body
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

    // Validate required fields
    if (!vehicle_name || !type || !registration_number || !daily_rent_price) {
      return res.status(400).json({ error: 'All fields are required' });
    }
// Call service to handle vehicle creation
    const result = await vehiclesService.createVehicle(
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status
    );
// Respond with success message and created vehicle data
    return res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      vehicle: result.rows[0],
    });

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all vehicles
const getAllVehicles = async (req: Request, res: Response) => {
  try {
    // Call service to fetch all vehicles
    const result = await vehiclesService.getAllVehicle();
// Respond with success message and list of vehicles
    return res.json({
      success: true,
      vehicles: result.rows,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get vehicle by ID
const getVehicleById = async (req: Request, res: Response) => {
  try {
    // Call service to fetch vehicle by ID
    const result = await vehiclesService.getVehicleById(req.params.vehicleId as string);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found',
      });
    }

    return res.json({
      success: true,
      vehicle: result.rows[0],
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update vehicle info
 */
const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

    const result = await vehiclesService.updateVehicle(
      req.params.vehicleId as string,
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status
    );

    return res.json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle: result.rows[0],
    });

  } catch (error: any) {
    const status = error.message === 'Vehicle not found' ? 404 : 400;

    return res.status(status).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete a vehicle
 */
const deleteVehicle = async (req: Request, res: Response) => {
  try {
    await vehiclesService.deleteVehicle(req.params.vehicleId as string);

    return res.json({
      success: true,
      message: 'Vehicle deleted successfully',
    });

  } catch (error: any) {
    const status = error.message === 'Vehicle not found' ? 404 : 400;

    return res.status(status).json({
      success: false,
      error: error.message,
    });
  }
};

export const vehiclesController = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
