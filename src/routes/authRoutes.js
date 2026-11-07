import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getProfile,
  getDashboardStats
} from '../controllers/authController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

const registerValidations = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['customer', 'admin']).withMessage('Role must be either customer or admin')
];

const loginValidations = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

router.post('/register', validate(registerValidations), register);
router.post('/login', validate(loginValidations), login);
router.get('/me', authenticate, getProfile);
router.get('/stats', authenticate, authorize('admin'), getDashboardStats);

export default router;
