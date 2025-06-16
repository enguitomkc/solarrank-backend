import { authenticateToken } from "../middleware/auth";
import { Router } from "express";
import { UsersController } from "@/controllers/usersController";

const router = Router();

// Public endpoint for leaderboard
router.get("/", UsersController.getUsers);

router.get("/:username", authenticateToken, UsersController.getUserProfile);
router.put("/:username", authenticateToken, UsersController.updateUserProfile);

export default router;