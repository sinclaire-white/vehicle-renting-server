import { Request, Response } from "express";
import { usersService } from "./users.service";

// Get all users

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await usersService.getAllusers();
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// update user
const updateUser = async (req: any, res: Response) => {
  try {
    // call service to update user
    const result = await usersService.updateUser(
      req.params.userId,
      req.body,
      req.user.id,
      req.user.role
    );
    res.json({
      success: true,
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// delete user
const deleteUser = async (req: any, res: Response) => {
  try {
    await usersService.deleteUser(
      req.params.userId as string,
      req.user.id,
      req.user.role
    );

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    const status = error.message === "User not found" ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error.message,
    });
  }
};

export const usersController = {
  getAllUsers,
  updateUser,
  deleteUser,
};
