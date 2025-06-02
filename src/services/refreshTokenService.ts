import { generateAccessToken, generateRefreshToken } from '@/utils/jwt';
import pool from '../config/database';
import { RefreshToken, UserPublic } from '../types/auth';
import crypto from 'crypto';
import { PoolClient } from 'pg';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export class RefreshTokenService {
  static async storeRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    const client = await pool.connect();
    
    try {
      const query = `
        INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at, is_revoked)
        VALUES ($1, $2, $3, $4, NOW(), false)
      `;
      
      const tokenId = crypto.randomUUID();
      await client.query(query, [tokenId, userId, token, expiresAt]);
    } finally {
      client.release();
    }
  }

  // Transaction-aware version that accepts a client
  static async storeRefreshTokenWithClient(client: PoolClient, userId: string, token: string, expiresAt: Date): Promise<void> {
    const query = `
      INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at, is_revoked)
      VALUES ($1, $2, $3, $4, NOW(), false)
    `;
    
    const tokenId = crypto.randomUUID();
    await client.query(query, [tokenId, userId, token, expiresAt]);
  }

  static async getRefreshToken(token: string): Promise<RefreshToken | null> {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT id, user_id as "userId", token, expires_at, created_at, is_revoked
        FROM refresh_tokens
        WHERE token = $1 AND is_revoked = false AND expires_at > NOW()
      `;
      
      const result = await client.query(query, [token]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as RefreshToken;
    } finally {
      client.release();
    }
  }

  static async revokeRefreshToken(token: string): Promise<void> {
    const client = await pool.connect();
    
    try {
      const query = `
        UPDATE refresh_tokens
        SET is_revoked = true
        WHERE token = $1
      `;
      
      await client.query(query, [token]);
    } finally {
      client.release();
    }
  }

  // Transaction-aware version that accepts a client
  static async revokeRefreshTokenWithClient(client: PoolClient, token: string): Promise<void> {
    const query = `
      UPDATE refresh_tokens
      SET is_revoked = true
      WHERE token = $1
    `;
    
    await client.query(query, [token]);
  }

  static async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    const client = await pool.connect();
    
    try {
      const query = `
        UPDATE refresh_tokens
        SET is_revoked = true
        WHERE user_id = $1
      `;
      
      await client.query(query, [userId]);
    } finally {
      client.release();
    }
  }

  static async cleanupExpiredTokens(): Promise<void> {
    const client = await pool.connect();
    
    try {
      const query = `
        DELETE FROM refresh_tokens
        WHERE expires_at < NOW() OR is_revoked = true
      `;
      
      await client.query(query);
    } finally {
      client.release();
    }
  }
} 