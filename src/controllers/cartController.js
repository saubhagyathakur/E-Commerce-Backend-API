import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Helper to compute server-side totals and format cart items
 */
export const calculateCartDetails = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    return {
      _id: cart._id,
      user: userId,
      items: [],
      totalItems: 0,
      totalAmount: 0
    };
  }

  // Filter out any products that might have been removed from the catalog
  let hasStaleItems = false;
  const validItems = [];

  for (const item of cart.items) {
    if (!item.product) {
      hasStaleItems = true;
      continue;
    }
    validItems.push(item);
  }

  if (hasStaleItems) {
    cart.items = validItems;
    await cart.save();
  }

  let totalAmount = 0;
  let totalItems = 0;

  const formattedItems = cart.items.map((item) => {
    const unitPrice = item.product.price;
    const itemSubtotal = Number((unitPrice * item.quantity).toFixed(2));
    totalAmount += itemSubtotal;
    totalItems += item.quantity;

    return {
      product: {
        _id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        stock: item.product.stock,
        imageUrl: item.product.imageUrl,
        category: item.product.category
      },
      quantity: item.quantity,
      unitPrice,
      subtotal: itemSubtotal
    };
  });

  totalAmount = Number(totalAmount.toFixed(2));

  return {
    _id: cart._id,
    user: userId,
    items: formattedItems,
    totalItems,
    totalAmount
  };
};

export const getCart = async (req, res, next) => {
  try {
    const cartDetails = await calculateCartDetails(req.user._id);
    return ApiResponse.success(res, 'Cart retrieved successfully', cartDetails);
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = parseInt(quantity, 10);

    if (!productId) {
      throw new ApiError(400, 'Product ID is required');
    }
    if (isNaN(qty) || qty < 1) {
      throw new ApiError(400, 'Quantity must be at least 1');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    const currentQty = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity : 0;
    const newQty = currentQty + qty;

    if (newQty > product.stock) {
      throw new ApiError(
        400,
        `Cannot add ${qty} item(s). Available stock is ${product.stock} (currently ${currentQty} in cart)`
      );
    }

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = newQty;
    } else {
      cart.items.push({ product: product._id, quantity: qty });
    }

    await cart.save();

    const updatedCartDetails = await calculateCartDetails(req.user._id);
    return ApiResponse.success(res, 'Item added to cart', updatedCartDetails);
  } catch (error) {
    next(error);
  }
};

export const updateCartItemQuantity = async (req, res, next) => {
  try {
    const productId = req.params.productId || req.body.productId;
    const { quantity } = req.body;

    if (!productId) {
      throw new ApiError(400, 'Product ID is required');
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty)) {
      throw new ApiError(400, 'Quantity must be a valid integer');
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      throw new ApiError(404, 'Item not found in cart');
    }

    if (qty <= 0) {
      // Quantity 0 removes the item
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        // Product was removed from store
        cart.items.splice(itemIndex, 1);
        await cart.save();
        throw new ApiError(404, 'Product no longer exists in catalog and was removed from cart');
      }

      if (qty > product.stock) {
        throw new ApiError(
          400,
          `Cannot update quantity to ${qty}. Only ${product.stock} units available in stock.`
        );
      }

      cart.items[itemIndex].quantity = qty;
    }

    await cart.save();

    const updatedCartDetails = await calculateCartDetails(req.user._id);
    return ApiResponse.success(res, 'Cart updated successfully', updatedCartDetails);
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    if (cart.items.length === initialLength) {
      throw new ApiError(404, 'Item not found in cart');
    }

    await cart.save();

    const updatedCartDetails = await calculateCartDetails(req.user._id);
    return ApiResponse.success(res, 'Item removed from cart', updatedCartDetails);
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    const updatedCartDetails = await calculateCartDetails(req.user._id);
    return ApiResponse.success(res, 'Cart cleared successfully', updatedCartDetails);
  } catch (error) {
    next(error);
  }
};
