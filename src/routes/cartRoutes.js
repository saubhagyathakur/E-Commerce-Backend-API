import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

// All cart endpoints require user authentication
router.use(authenticate);

router.get('/', getCart);

router.post(
  '/',
  validate([
    body('productId').notEmpty().withMessage('productId is required'),
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be an integer >= 1')
  ]),
  addToCart
);

router.put(
  '/:productId',
  validate([
    param('productId').notEmpty().withMessage('Valid product ID required'),
    body('quantity')
      .notEmpty()
      .withMessage('Quantity is required')
      .isInt({ min: 0 })
      .withMessage('Quantity must be an integer >= 0')
  ]),
  updateCartItemQuantity
);

router.patch(
  '/:productId',
  validate([
    param('productId').notEmpty().withMessage('Valid product ID required'),
    body('quantity')
      .notEmpty()
      .withMessage('Quantity is required')
      .isInt({ min: 0 })
      .withMessage('Quantity must be an integer >= 0')
  ]),
  updateCartItemQuantity
);

router.put(
  '/',
  validate([
    body('productId').notEmpty().withMessage('productId is required'),
    body('quantity')
      .notEmpty()
      .withMessage('Quantity is required')
      .isInt({ min: 0 })
      .withMessage('Quantity must be an integer >= 0')
  ]),
  updateCartItemQuantity
);

router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

export default router;
