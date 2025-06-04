import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { registerValidation, loginValidation, refreshTokenValidation } from '../validators/auth';
import { validateInputs } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/signup', registerValidation, validateInputs, AuthController.signup);
router.post('/login', loginValidation, validateInputs, AuthController.login);
router.post('/refresh', refreshTokenValidation, validateInputs, AuthController.refreshToken);
router.post('/logout', refreshTokenValidation, validateInputs, AuthController.logout);

// Protected routes
router.get('/verify', authenticateToken, AuthController.verifyToken);

export default router; 