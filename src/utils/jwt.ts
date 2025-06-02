import jwt, { SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = `${process.env.REFRESH_TOKEN_EXPIRES_IN}d` || '7d';

export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp' | 'tokenType'>): string => {
  const tokenPayload = { ...payload, tokenType: 'access' as const };
  return jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as string,
  } as SignOptions);
};

export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp' | 'tokenType'>): string => {
  const tokenPayload = { ...payload, tokenType: 'refresh' as const };
  return jwt.sign(tokenPayload, REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as string
  } as SignOptions);
};

export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    if (decoded.tokenType !== 'access') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as JWTPayload;
    if (decoded.tokenType !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};

// Legacy function for backward compatibility
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp' | 'tokenType'>): string => {
  return generateAccessToken(payload);
};

// Legacy function for backward compatibility  
export const verifyToken = (token: string): JWTPayload => {
  return verifyAccessToken(token);
}; 