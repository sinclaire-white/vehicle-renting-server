import { Request, Response } from "express";
import { authService } from "./auth.service";

// user registration controller
const signUpController = async (req: Request, res: Response) => {
  try {
    // extract data from request body
    const { name, email, password, phone, role } = req.body;

    // basic validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }
    // call service to handle sign-up logic
    const result = await authService.signUp(name, email, password, phone, role);

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      data: result.rows[0], // returning only the first row (the newly created user)
    });
  } catch (error: any) {
    res.status(400).json({
      succsess: false,
      message: error.message,
    });
  }
};

// user sign-in controller
const signInController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }
    // call service to verify credentials and generate token
    const result = await authService.signIn(email, password);
    // respond with token and user info
    res.status(200).json({
      success: true,
      message: "Sign-in successful",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      succsess: false,
      message: error.message,
    });
  }
};

export const authController = {
  signUpController,
  signInController,
};
