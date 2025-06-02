import { authenticateToken } from "../middleware/auth";
import { Router } from "express";
import { UsersController } from "@/controllers/usersController";

const router = Router();

router.get("/:username", authenticateToken, UsersController.getUserProfile);
router.put("/:username", authenticateToken, UsersController.updateUserProfile);

export default router;