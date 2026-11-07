import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Product } from '../src/models/Product.js';

describe('Order Management API', () => {
  let customerToken = '';
  let adminToken = '';
  let product1, product2;

  beforeEach(async () => {
    // Admin
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Order Admin',
      email: 'order_admin@example.com',
      password: 'AdminPassword123',
      role: 'admin',
      adminSecretKey: 'admin_registration_secret_key_9999'
    });
    adminToken = adminRes.body.data.token;

    // Customer
    const custRes = await request(app).post('/api/auth/register').send({
      name: 'Order Customer',
      email: 'order_cust@example.com',
      password: 'CustPassword123',
      role: 'customer'
    });
    customerToken = custRes.body.data.token;

    product1 = await Product.create({
      name: 'Wireless Earbuds',
      description: 'ANC Earbuds',
      price: 1000,
      category: 'Audio',
      stock: 5,
      imageUrl: 'https://example.com/earbuds.jpg'
    });

    product2 = await Product.create({
      name: 'Laptop Stand',
      description: 'Aluminum Stand',
      price: 800,
      category: 'Office',
      stock: 4,
      imageUrl: 'https://example.com/stand.jpg'
    });
  });

  it('should reject placing an order when cart is empty', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/empty/i);
  });

  it('should place an order from cart, verify stock, calculate total, reduce inventory and clear cart', async () => {
    // 1. Add items to cart (2x Earbuds = 2000, 1x Stand = 800)
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product1._id, quantity: 2 });

    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product2._id, quantity: 1 });

    // 2. Place order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        shippingAddress: {
          street: '10 Downing St',
          city: 'London',
          state: 'Greater London',
          zipCode: 'SW1A 2AA',
          country: 'UK'
        }
      });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.success).toBe(true);
    expect(orderRes.body.data.totalAmount).toBe(2800);
    expect(orderRes.body.data.items.length).toBe(2);
    expect(orderRes.body.data.orderStatus).toBe('Processing');

    // 3. Verify inventory reduction (Earbuds: 5 - 2 = 3; Stand: 4 - 1 = 3)
    const updatedProd1 = await Product.findById(product1._id);
    const updatedProd2 = await Product.findById(product2._id);
    expect(updatedProd1.stock).toBe(3);
    expect(updatedProd2.stock).toBe(3);

    // 4. Verify cart cleared
    const cartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(cartRes.body.data.items.length).toBe(0);
    expect(cartRes.body.data.totalAmount).toBe(0);
  });

  it('should allow customer to view their own orders', async () => {
    // Put item in cart and checkout
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product1._id, quantity: 1 });

    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({});

    const res = await request(app)
      .get('/api/orders/my-orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].totalAmount).toBe(1000);
  });

  it('should allow admin to view all customer orders and update status (Processing -> Shipped -> Delivered)', async () => {
    // Place an order as customer
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product1._id, quantity: 1 });

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({});

    const orderId = orderRes.body.data._id;

    // Admin views all orders
    const allOrdersRes = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(allOrdersRes.status).toBe(200);
    expect(allOrdersRes.body.data.length).toBe(1);

    // Admin updates order status to Shipped
    const updateRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Shipped' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.orderStatus).toBe('Shipped');

    // Customer is forbidden from updating order status
    const custUpdateRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'Delivered' });

    expect(custUpdateRes.status).toBe(403);
  });
});
