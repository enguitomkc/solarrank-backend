import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { User, UserPublic } from '../types/auth';
import { UserProfileResponse } from '@/types/user';
import { PoolClient } from 'pg';

const SALT_ROUNDS = 12;

export class UserService {
  static async createUser(client: PoolClient, name: string, email: string, password: string): Promise<UserPublic> {
    throw new Error('Not implemented');
    
    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user
      const result = await client.query(
        `INSERT INTO users (name, email, password_hash, role, total_energy, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
         RETURNING id, name, username, email, profile_image, role, total_energy, created_at`,
        [name, email, passwordHash, 'user', 0]
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async authenticateUser(email: string, password: string): Promise<UserPublic> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user: User = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Return user without password hash
      const { password_hash, ...userPublic } = user;
      return userPublic;
    } finally {
      client.release();
    }
  }

  static async getUserById(id: string): Promise<UserPublic | null> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT id, name, username, email, profile_image, role, total_energy, created_at FROM users WHERE id = $1',
        [id]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  static async getUserProfile(username: string): Promise<UserProfileResponse | null> {
    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT id, name, username, email, profile_image, role, total_energy, created_at FROM users WHERE username = $1',
        [username]
      );

      const profile = result.rows.length > 0 ? result.rows[0] : null;

      // const stats = await client.query(
      //   'SELECT * FROM stats WHERE user_id = $1',
      //   [profile.id]
      // );

      // const achievements = await client.query(
      //   'SELECT * FROM achievements WHERE user_id = $1',
      //   [profile.id]
      // );

      // const activities = await client.query(
      //   'SELECT * FROM activities WHERE user_id = $1',
      //   [profile.id]
      // );

      return {
        success: true,
        message: 'User profile fetched successfully',
        error: '',
        data: {
          profile,
          stats: null,
          achievements: [],
          activities: []
        }

      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        success: false,
        message: 'Error fetching user profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      };

    } finally {
      client.release();
    }
  }

  static async updateUserProfile(id: string, updates: Partial<Pick<User, 'name' | 'profile_image'>>): Promise<UserPublic> {
    const client = await pool.connect();
    
    try {
      const setClause = [];
      const values = [];
      let paramCount = 1;

      if (updates.name) {
        setClause.push(`name = $${paramCount}`);
        values.push(updates.name);
        paramCount++;
      }

      if (updates.profile_image) {
        setClause.push(`profile_image = $${paramCount}`);
        values.push(updates.profile_image);
        paramCount++;
      }

      setClause.push(`updated_at = NOW()`);
      values.push(id);

      const result = await client.query(
        `UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramCount} 
        RETURNING id, name, email, profile_image, role, total_energy, created_at`,
        values
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async updateUserEnergy(id: string, energyChange: number): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query(
        'UPDATE users SET total_energy = total_energy + $1, updated_at = NOW() WHERE id = $2',
        [energyChange, id]
      );
    } finally {
      client.release();
    }
  }
} 