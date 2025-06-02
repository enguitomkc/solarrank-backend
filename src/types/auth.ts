export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password_hash: string;
  profile_image?: string;
  role: 'user' | 'admin';
  total_energy: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: string;
  name: string;
  username: string;
  email: string;
  profile_image?: string;
  role: 'user' | 'admin';
  total_energy: number;
  created_at: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  tokenType: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expires_at: Date;
  created_at: Date;
  is_revoked: boolean;
}

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserPublic;
  accessToken?: string;
  refreshToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
} 