import { Product } from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category: category.trim(),
      stock: Number(stock),
      imageUrl
    });

    return ApiResponse.created(res, 'Product created successfully', product);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    // Search filter across name, description, category
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
    }

    // Category filter
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      query.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        const min = Number(minPrice);
        if (!isNaN(min)) query.price.$gte = min;
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        const max = Number(maxPrice);
        if (!isNaN(max)) query.price.$lte = max;
      }
      if (Object.keys(query.price).length === 0) {
        delete query.price;
      }
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'name_asc') sortOption = { name: 1 };
    else if (sort === 'name_desc') sortOption = { name: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber)
    ]);

    const totalPages = Math.ceil(totalProducts / limitNumber) || 1;

    return ApiResponse.success(res, 'Products retrieved successfully', products, 200, {
      pagination: {
        total: totalProducts,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasMore: pageNumber < totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      throw new ApiError(404, `Product not found with id ${id}`);
    }

    return ApiResponse.success(res, 'Product retrieved successfully', product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, imageUrl } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError(404, `Product not found with id ${id}`);
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category.trim();
    if (stock !== undefined) product.stock = Number(stock);
    if (imageUrl !== undefined) product.imageUrl = imageUrl;

    await product.save();

    return ApiResponse.success(res, 'Product updated successfully', product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      throw new ApiError(404, `Product not found with id ${id}`);
    }

    return ApiResponse.success(res, 'Product deleted successfully', { _id: id });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    return ApiResponse.success(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};
