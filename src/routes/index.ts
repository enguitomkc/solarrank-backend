import { Router, Request, Response } from 'express';
import pool from '../config/database';
import authRoutes from './auth';

const router = Router();

// Authentication routes
router.use('/auth', authRoutes);


export const routes = router; 