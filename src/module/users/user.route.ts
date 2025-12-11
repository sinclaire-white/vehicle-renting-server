import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { usersController } from "./user.controller";

const router = Router();
// Authenticated users can view their own profile
router.get("/profile", authenticate, usersController.getOwnProfile);
// Only admin can view all users
router.get("/", authenticate, authorize("admin"), usersController.getAllUsers);
// Only authenticated users can update their own profile.
router.put("/:userId", authenticate, usersController.updateUser);
// Only admin can delete users.
router.delete(
  "/:userId",
  authenticate,
  authorize("admin"),
  usersController.deleteUser
);

export const usersRoute = router;
