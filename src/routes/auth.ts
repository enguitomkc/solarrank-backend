import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { registerValidation, loginValidation, refreshTokenValidation } from '../validators/auth';
import { validateInputs } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', registerValidation, validateInputs, AuthController.register);
router.post('/login', loginValidation, validateInputs, AuthController.login);
router.post('/refresh', refreshTokenValidation, validateInputs, AuthController.refreshToken);
router.post('/logout', refreshTokenValidation, validateInputs, authenticateToken, AuthController.logout);

// Protected routes
router.get('/verify', authenticateToken, AuthController.verifyToken);

export default router; 