import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

// All order endpoints require authentication
router.use(authenticate);

// Customer endpoints
router.post('/', placeOrder);
router.get('/my-orders', getMyOrders);

// Admin-only: list all customer orders
router.get('/', authorize('admin'), getAllOrders);

// Get single order (customer for own order, admin for all)
router.get('/:id', getOrderById);

// Admin-only: update status
router.patch(
  '/:id/status',
  authorize('admin'),
  validate([
    param('id').notEmpty().withMessage('Order ID is required'),
    body('status')
      .notEmpty()
      .withMessage('Order status is required')
      .isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])
      .withMessage('Invalid status. Allowed: Pending, Processing, Shipped, Delivered, Cancelled')
  ]),
  updateOrderStatus
);

router.put(
  '/:id/status',
  authorize('admin'),
  validate([
    param('id').notEmpty().withMessage('Order ID is required'),
    body('status')
      .notEmpty()
      .withMessage('Order status is required')
      .isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])
      .withMessage('Invalid status. Allowed: Pending, Processing, Shipped, Delivered, Cancelled')
  ]),
  updateOrderStatus
);

export default router;
