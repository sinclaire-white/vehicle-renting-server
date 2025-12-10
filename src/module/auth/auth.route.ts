import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

// Route for creating a new user
router.post("/signup", authController.signUpController);
// Route for user sign-in
router.post("/signin", authController.signInController);

export default router;
