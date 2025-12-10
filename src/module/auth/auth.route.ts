import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post('/signup', authController.signUpController);
router.post('/signin', authController.signInController);

export default router;