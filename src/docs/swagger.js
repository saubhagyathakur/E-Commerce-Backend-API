export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'E-Commerce Backend API',
    version: '1.0.0',
    description: 'Production-grade E-Commerce Backend API built with Node.js, Express, and MongoDB. Fulfills all requirements for user authentication, product catalog, cart management, and order processing.'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from /api/auth/login'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['customer', 'admin'] },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          category: { type: 'string' },
          stock: { type: 'integer' },
          imageUrl: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      CartItem: {
        type: 'object',
        properties: {
          product: { $ref: '#/components/schemas/Product' },
          quantity: { type: 'integer' },
          unitPrice: { type: 'number' },
          subtotal: { type: 'number' }
        }
      },
      Cart: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/CartItem' }
          },
          totalItems: { type: 'integer' },
          totalAmount: { type: 'number' }
        }
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          customer: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product: { type: 'string' },
                name: { type: 'string' },
                price: { type: 'number' },
                quantity: { type: 'integer' },
                imageUrl: { type: 'string' }
              }
            }
          },
          totalAmount: { type: 'number' },
          orderStatus: {
            type: 'string',
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
          },
          shippingAddress: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              country: { type: 'string' }
            }
          },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new customer or admin account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Jane Doe' },
                  email: { type: 'string', example: 'jane@example.com' },
                  password: { type: 'string', example: 'SecurePassword123' },
                  role: { type: 'string', enum: ['customer', 'admin'], default: 'customer' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Registration successful' },
          400: { description: 'Validation error' },
          409: { description: 'Email already exists' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate user and return JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'customer@example.com' },
                  password: { type: 'string', example: 'Customer@123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Authentication successful' },
          401: { description: 'Invalid email or password' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get currently authenticated user details',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profile retrieved' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Browse and search products with filters',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term for name/description/category' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Category filter' },
          { name: 'minPrice', in: 'query', schema: { type: 'number' }, description: 'Minimum price filter' },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' }, description: 'Maximum price filter' },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['price_asc', 'price_desc', 'name_asc', 'name_desc'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
        ],
        responses: {
          200: { description: 'List of matching products' }
        }
      },
      post: {
        tags: ['Products'],
        summary: 'Create a new product (Admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'description', 'price', 'category', 'stock', 'imageUrl'],
                properties: {
                  name: { type: 'string', example: 'Wireless Noise-Cancelling Headphones' },
                  description: { type: 'string', example: 'Premium high-fidelity audio with 40-hour battery life' },
                  price: { type: 'number', example: 199.99 },
                  category: { type: 'string', example: 'Electronics' },
                  stock: { type: 'integer', example: 50 },
                  imageUrl: { type: 'string', example: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Product created' },
          403: { description: 'Admin access required' }
        }
      }
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product details by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Product details' },
          404: { description: 'Product not found' }
        }
      },
      put: {
        tags: ['Products'],
        summary: 'Update product by ID (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  category: { type: 'string' },
                  stock: { type: 'integer' },
                  imageUrl: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Product updated' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' }
        }
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product by ID (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Product deleted' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' }
        }
      }
    },
    '/api/cart': {
      get: {
        tags: ['Shopping Cart'],
        summary: 'View customer shopping cart with server-calculated total',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Cart contents with calculated totals' }
        }
      },
      post: {
        tags: ['Shopping Cart'],
        summary: 'Add product to cart',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId'],
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'integer', default: 1 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Item added to cart' },
          400: { description: 'Stock exceeded or invalid quantity' }
        }
      },
      delete: {
        tags: ['Shopping Cart'],
        summary: 'Clear entire shopping cart',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Cart cleared' }
        }
      }
    },
    '/api/cart/{productId}': {
      put: {
        tags: ['Shopping Cart'],
        summary: 'Update quantity of an item in cart',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['quantity'],
                properties: {
                  quantity: { type: 'integer', example: 3 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Cart updated' },
          400: { description: 'Invalid quantity or stock exceeded' }
        }
      },
      delete: {
        tags: ['Shopping Cart'],
        summary: 'Remove item from cart',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Item removed from cart' }
        }
      }
    },
    '/api/orders': {
      post: {
        tags: ['Order Management'],
        summary: 'Place order from current cart (verifies stock and reduces inventory)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  shippingAddress: {
                    type: 'object',
                    properties: {
                      street: { type: 'string' },
                      city: { type: 'string' },
                      state: { type: 'string' },
                      zipCode: { type: 'string' },
                      country: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Order created successfully' },
          400: { description: 'Empty cart or insufficient stock' }
        }
      },
      get: {
        tags: ['Order Management'],
        summary: 'List all customer orders (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'List of all customer orders' }
        }
      }
    },
    '/api/orders/my-orders': {
      get: {
        tags: ['Order Management'],
        summary: 'View authenticated customer orders',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of customer orders' }
        }
      }
    },
    '/api/orders/{id}/status': {
      patch: {
        tags: ['Order Management'],
        summary: 'Update order status (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Order status updated' },
          400: { description: 'Invalid status' },
          403: { description: 'Forbidden' },
          404: { description: 'Order not found' }
        }
      }
    }
  }
};
