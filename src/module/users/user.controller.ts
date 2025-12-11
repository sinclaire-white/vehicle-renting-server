import { Request, Response } from "express";
import { usersService } from "./users.service";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await usersService.getAllUsers();
    
    res.json({ 
      success: true,
      users: result.rows 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

const updateUser = async (req: any, res: Response) => {
  try {
    const result = await usersService.updateUser(
      req.params.userId as string,
      req.body,
      req.user.id,
      req.user.role
    );
    
    res.json({ 
      success: true,
      message: 'User updated successfully', 
      user: result.rows[0] 
    });
  } catch (error: any) {
    const status = error.message === 'User not found' ? 404 : error.message.includes('only') ? 403 : 400;
    res.status(status).json({ 
      success: false,
      error: error.message 
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    await usersService.deleteUser(req.params.userId as string);
    
    res.json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (error: any) {
    const status = error.message === 'User not found' ? 404 : 400;
    res.status(status).json({ 
      success: false,
      error: error.message 
    });
  }
};

export const usersController = {
  getAllUsers,
  updateUser,
  deleteUser
};