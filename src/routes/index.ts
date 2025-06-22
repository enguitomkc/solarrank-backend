import { Router, Request, Response } from 'express';
import pool from '../config/database';
import authRoutes from './auth';
import usersRoutes from './users';
import postsRoutes from './posts';

const router = Router();

// Authentication routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/posts', postsRoutes);

export const routes = router; 