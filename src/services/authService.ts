import { UserService } from './userService';
import { RefreshTokenService } from './refreshTokenService';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { UserPublic } from '../types/auth';
import pool from '../config/database';
import { PoolClient } from 'pg';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: UserPublic;
  tokens: AuthTokens;
}

export class AuthService {
  private static readonly REFRESH_TOKEN_EXPIRY_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || '7');

  static async registerUser(name: string, email: string, password: string): Promise<AuthResult> {

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const user = await UserService.createUser(client, name, email, password);
      const tokens = await this.generateAndStoreTokens(user);
      await client.query('COMMIT');
    
      return { user, tokens };
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error('Registration failed');
    } finally {
      client.release();
    }
  }

  static async loginUser(email: string, password: string): Promise<AuthResult> {

    const user = await UserService.authenticateUser(email, password);

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Store new refresh token with expiry
      const refreshExpiresAt = new Date(
        Date.now() + this.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      );
      await RefreshTokenService.storeRefreshTokenWithClient(client, user.id, newRefreshToken, refreshExpiresAt);

      // Revoke all existing refresh tokens for security
      await RefreshTokenService.revokeAllUserRefreshTokens(user.id);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error('Login failed');
    } finally {
      client.release();
    }
  
    console.log(user, "user");

    return { user, tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken } };
  }

  static async refreshUserToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Verify token format and signature
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }

    // Check if token exists in database and is not revoked
    const storedToken = await RefreshTokenService.getRefreshToken(refreshToken);
    if (!storedToken) {
      throw new Error('Refresh token not found or expired');
    }

    // Verify user still exists
    const user = await UserService.getUserById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    
    return { accessToken: newAccessToken };
  }

  static async logoutUser(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await RefreshTokenService.revokeRefreshToken(refreshToken);
    }
  }

  static async verifyUser(userId: string): Promise<UserPublic> {
    const user = await UserService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  private static async generateAndStoreTokens(user: UserPublic): Promise<AuthTokens> {
    
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token with expiry
    const refreshExpiresAt = new Date(
      Date.now() + this.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );
    await RefreshTokenService.storeRefreshToken(user.id, refreshToken, refreshExpiresAt);

    return { accessToken, refreshToken };
  }
} 