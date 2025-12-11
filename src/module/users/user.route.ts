import { Router } from "express";
import { usersController } from "./user.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.get('/', authenticate, authorize('admin'), usersController.getAllUsers);
router.put('/:userId', authenticate, usersController.updateUser);
router.delete('/:userId', authenticate, authorize('admin'), usersController.deleteUser);

export const usersRoute = router;