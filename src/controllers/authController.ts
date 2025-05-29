import { Response } from 'express';
import { validationResult } from 'express-validator';
import { UserService } from '../services/userService';
import { generateToken } from '../utils/jwt';
import { AuthRequest, RegisterRequest, LoginRequest, AuthResponse } from '../types/auth';

export class AuthController {
  static async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { name, email, password }: RegisterRequest = req.body;

      // Create user
      const user = await UserService.createUser(name, email, password);

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      const response: AuthResponse = {
        success: true,
        message: 'User registered successfully',
        user,
        token
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      
      const response: AuthResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      };

      res.status(400).json(response);
    }
  }

  static async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { email, password }: LoginRequest = req.body;

      // Authenticate user
      const user = await UserService.authenticateUser(email, password);

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      const response: AuthResponse = {
        success: true,
        message: 'Login successful',
        user,
        token
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Login error:', error);
      
      const response: AuthResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      };

      res.status(401).json(response);
    }
  }

  static async verifyToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
        return;
      }

      const user = await UserService.getUserById(req.user.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        user
      });
    } catch (error) {
      console.error('Token verification error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Token verification failed'
      });
    }
  }
} 