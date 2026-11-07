import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { shippingAddress } = req.body || {};

    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new ApiError(400, 'Your cart is empty. Add products before placing an order.');
    }

    // Step 1: Pre-verify that all products still exist and have sufficient stock
    for (const item of cart.items) {
      if (!item.product) {
        throw new ApiError(400, 'One or more items in your cart are no longer available in the catalog.');
      }
      if (item.quantity > item.product.stock) {
        throw new ApiError(
          400,
          `Insufficient stock for "${item.product.name}". Available: ${item.product.stock}, Requested: ${item.quantity}. Please adjust your cart.`
        );
      }
    }

    // Step 2: Atomically deduct inventory with rollback safeguard on race condition
    const deductedItems = [];
    let stockDeductionFailed = false;
    let failedItemName = '';

    for (const item of cart.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { returnDocument: 'after' }
      );

      if (!updatedProduct) {
        stockDeductionFailed = true;
        failedItemName = item.product.name;
        break;
      }

      deductedItems.push({
        productId: item.product._id,
        quantity: item.quantity
      });
    }

    // If deduction failed due to concurrent checkout, roll back previous deductions
    if (stockDeductionFailed) {
      for (const deducted of deductedItems) {
        await Product.findByIdAndUpdate(deducted.productId, {
          $inc: { stock: deducted.quantity }
        });
      }
      throw new ApiError(
        400,
        `Inventory for "${failedItemName}" was claimed by another customer. Please review your cart.`
      );
    }

    // Step 3: Create order snapshot
    let totalAmount = 0;
    const orderItems = cart.items.map((item) => {
      const unitPrice = item.product.price;
      const subtotal = Number((unitPrice * item.quantity).toFixed(2));
      totalAmount += subtotal;

      return {
        product: item.product._id,
        name: item.product.name,
        price: unitPrice,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl || ''
      };
    });

    totalAmount = Number(totalAmount.toFixed(2));

    const order = await Order.create({
      customer: userId,
      items: orderItems,
      totalAmount,
      orderStatus: 'Processing',
      shippingAddress: shippingAddress || {
        street: '123 Main St',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      }
    });

    // Step 4: Clear user cart
    cart.items = [];
    await cart.save();

    return ApiResponse.created(res, 'Order placed successfully', order);
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name category imageUrl');

    return ApiResponse.success(res, 'Customer orders retrieved successfully', orders);
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status && status.trim() !== '' && status !== 'all') {
      query.orderStatus = status;
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const skip = (pageNumber - 1) * limitNumber;

    const [totalOrders, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .populate('customer', 'name email')
        .populate('items.product', 'name category imageUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
    ]);

    return ApiResponse.success(res, 'All orders retrieved successfully', orders, 200, {
      pagination: {
        total: totalOrders,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalOrders / limitNumber) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('customer', 'name email')
      .populate('items.product', 'name category imageUrl');

    if (!order) {
      throw new ApiError(404, `Order not found with id ${id}`);
    }

    // Role check: customer can only view their own order; admin can view any order
    if (
      req.user.role !== 'admin' &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      throw new ApiError(403, 'You are not authorized to view this order');
    }

    return ApiResponse.success(res, 'Order details retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      throw new ApiError(
        400,
        `Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      throw new ApiError(404, `Order not found with id ${id}`);
    }

    // If order was cancelled from active state, restore inventory
    if (status === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    order.orderStatus = status;
    await order.save();

    return ApiResponse.success(res, `Order status updated to '${status}' successfully`, order);
  } catch (error) {
    next(error);
  }
};
