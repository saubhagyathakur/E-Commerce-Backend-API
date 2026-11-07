import { Router } from 'express';
import { body } from 'express-validator';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCategories
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

const productValidations = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 150 }).withMessage('Product name cannot exceed 150 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Product description is required'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a number greater than or equal to 0'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  body('stock')
    .notEmpty().withMessage('Stock is required')
    .isInt({ min: 0 }).withMessage('Stock must be an integer greater than or equal to 0'),
  body('imageUrl')
    .trim()
    .notEmpty().withMessage('Image URL is required')
];

const updateProductValidations = [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Product description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a number >= 0'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be an integer >= 0'),
  body('imageUrl').optional().trim().notEmpty().withMessage('Image URL cannot be empty')
];

// Public endpoints
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin-only endpoints
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(productValidations),
  createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateProductValidations),
  updateProduct
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateProductValidations),
  updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteProduct
);

export default router;
