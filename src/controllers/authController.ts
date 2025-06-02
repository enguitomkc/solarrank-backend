import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest, RegisterRequest, LoginRequest, RefreshTokenRequest } from '../types/auth';
import { AuthService } from '../services/authService';

export class AuthController {
  static async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, email, password }: RegisterRequest = req.body;

      // Delegate to service
      const result = await AuthService.registerUser(name, email, password);

      // Return response
      res.status(201).json({
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken
      });
      return;
    } catch (error) {
      res.status(400).json({ error: "Registration failed" });
      return;
    }
  }

  static async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      // Delegate to service
      const result = await AuthService.loginUser(email, password);

      // Return response
      res.status(200).json({
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken
      });
      return;
    } catch (error) {
      res.status(400).json({ error: "Login failed" });
      return;
    }
  }

  static async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Parse inputs
      const { refreshToken }: RefreshTokenRequest = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: "Refresh token is required" });
        // ResponseHelper.error(res, 'Refresh token is required');
        return;
      }

      // Delegate to service
      const result = await AuthService.refreshUserToken(refreshToken);

      // Return response
      res.status(200).json({
        accessToken: result.accessToken,
      });
      return;
    } catch (error) {
      res.status(400).json({ error: "Token refresh failed" });
      return;
    }
  }

  static async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Parse inputs
      const { refreshToken }: RefreshTokenRequest = req.body;

      // Delegate to service
      await AuthService.logoutUser(refreshToken);

      // Return response
      res.status(200).json({ message: "Logout successful" });
      return;
    } catch (error) {
      res.status(400).json({ error: "Logout failed" });
      return;
    }
  }

  static async verifyToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Parse inputs
      if (!req.user?.userId) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }

      // Delegate to service
      const user = await AuthService.verifyUser(req.user.userId);

      // Return response
      res.status(200).json({ user });
      return;
    } catch (error) {
      res.status(400).json({ error: "Token verification failed" });
      return;
    }
  }
} 