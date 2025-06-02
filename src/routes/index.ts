import { Router, Request, Response } from 'express';
import pool from '../config/database';
import authRoutes from './auth';
import usersRoutes from './users';

const router = Router();

// Authentication routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

export const routes = router; 