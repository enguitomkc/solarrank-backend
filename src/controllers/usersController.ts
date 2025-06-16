import { UserService } from "@/services/usersService";
import { Request, Response } from "express";

export class UsersController {
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

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