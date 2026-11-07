import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Product } from '../src/models/Product.js';

describe('Product Management API', () => {
  let adminToken = '';
  let customerToken = '';

  beforeEach(async () => {
    // Create admin
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Admin User',
      email: 'admin_test@example.com',
      password: 'AdminPassword123',
      role: 'admin',
      adminSecretKey: 'admin_registration_secret_key_9999'
    });
    adminToken = adminRes.body.data.token;

    // Create customer
    const custRes = await request(app).post('/api/auth/register').send({
      name: 'Customer User',
      email: 'customer_test@example.com',
      password: 'CustomerPassword123',
      role: 'customer'
    });
    customerToken = custRes.body.data.token;
  });

  const sampleProduct = {
    name: 'Wireless Earbuds',
    description: 'High quality wireless earbuds',
    price: 1299,
    category: 'Audio',
    stock: 10,
    imageUrl: 'https://example.com/earbuds.jpg'
  };

  it('should allow admin to create a new product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleProduct);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(sampleProduct.name);
    expect(res.body.data.price).toBe(1299);
    expect(res.body.data.stock).toBe(10);
  });

  it('should forbid customer from creating a product (403)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(sampleProduct);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow public to browse and list products', async () => {
    await Product.create(sampleProduct);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should search products by keyword and filter by category & price', async () => {
    await Product.create([
      {
        name: 'USB-C Hub',
        description: 'Multiport adapter',
        price: 899,
        category: 'Accessories',
        stock: 5,
        imageUrl: 'https://example.com/hub.jpg'
      },
      {
        name: 'Mechanical Keyboard',
        description: 'Tactile switches',
        price: 2499,
        category: 'Electronics',
        stock: 15,
        imageUrl: 'https://example.com/kb.jpg'
      },
      {
        name: 'USB-C Cable 1m',
        description: 'Fast charging cable',
        price: 299,
        category: 'Accessories',
        stock: 30,
        imageUrl: 'https://example.com/cable.jpg'
      }
    ]);

    // Search keyword
    const searchRes = await request(app).get('/api/products?search=usb-c');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.length).toBe(2);

    // Category filter
    const catRes = await request(app).get('/api/products?category=Accessories');
    expect(catRes.status).toBe(200);
    expect(catRes.body.data.length).toBe(2);

    // Price range filter
    const priceRes = await request(app).get('/api/products?minPrice=500&maxPrice=1000');
    expect(priceRes.status).toBe(200);
    expect(priceRes.body.data.length).toBe(1);
    expect(priceRes.body.data[0].name).toBe('USB-C Hub');
  });

  it('should get single product details by id', async () => {
    const product = await Product.create(sampleProduct);

    const res = await request(app).get(`/api/products/${product._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(sampleProduct.name);
  });

  it('should allow admin to update a product and forbid customer', async () => {
    const product = await Product.create(sampleProduct);

    // Customer attempt
    const custAttempt = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ price: 1499 });
    expect(custAttempt.status).toBe(403);

    // Admin attempt
    const adminRes = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 1499, stock: 20 });

    expect(adminRes.status).toBe(200);
    expect(adminRes.body.data.price).toBe(1499);
    expect(adminRes.body.data.stock).toBe(20);
  });

  it('should allow admin to delete a product', async () => {
    const product = await Product.create(sampleProduct);

    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const check = await Product.findById(product._id);
    expect(check).toBeNull();
  });
});
