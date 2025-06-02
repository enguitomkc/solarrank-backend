import { UserService } from "@/services/userService";
import { Request, Response } from "express";

export class UsersController {
  static async getUserProfile(req: Request, res: Response) {
    console.log('getUserProfile', req.params);
    const { username } = req.params;
    const user = await UserService.getUserProfile(username);
    res.json(user);
  }

  static async updateUserProfile(req: Request, res: Response) {
    const { username } = req.params;
    const user = await UserService.updateUserProfile(username, req.body);
    res.json(user);
  }
}