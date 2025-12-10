import { Router } from "express";
import { vehiclesController } from "./vehicles.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();
/**
 * Only admin can create, update or delete vehicles.
 * Normal users can only view vehicles.
 */

router.post(
  "/",
  authenticate,
  authorize("admin"),
  vehiclesController.createVehicle
);
router.get("/", vehiclesController.getAllVehicles);
router.get("/:vehicleId", vehiclesController.getVehicleById);
router.put(
  "/:vehicleId",
  authenticate,
  authorize("admin"),
  vehiclesController.updateVehicle
);
router.delete(
  "/:vehicleId",
  authenticate,
  authorize("admin"),
  vehiclesController.deleteVehicle
);

export const vehiclesRoute = router;
