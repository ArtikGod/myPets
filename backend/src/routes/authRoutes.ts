import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  refreshToken,
  registerTelegramUser,
} from '../controllers/authController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/telegram', registerTelegramUser);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/refresh', authenticate, refreshToken);

export default router;