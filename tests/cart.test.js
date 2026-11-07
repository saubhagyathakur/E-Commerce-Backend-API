import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Product } from '../src/models/Product.js';

describe('Shopping Cart API', () => {
  let customerToken = '';
  let product1, product2;

  beforeEach(async () => {
    const custRes = await request(app).post('/api/auth/register').send({
      name: 'Cart Customer',
      email: 'cart_cust@example.com',
      password: 'CartPassword123',
      role: 'customer'
    });
    customerToken = custRes.body.data.token;

    product1 = await Product.create({
      name: 'Wireless Earbuds',
      description: 'ANC Earbuds',
      price: 1200,
      category: 'Audio',
      stock: 5,
      imageUrl: 'https://example.com/earbuds.jpg'
    });

    product2 = await Product.create({
      name: 'USB-C Cable',
      description: 'Durable Cable',
      price: 300,
      category: 'Accessories',
      stock: 10,
      imageUrl: 'https://example.com/cable.jpg'
    });
  });

  it('should return empty cart initially with totalAmount 0', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.totalAmount).toBe(0);
  });

  it('should add products to cart and calculate total value on the server', async () => {
    // Add product1 (qty 2) -> 2 * 1200 = 2400
    const addRes1 = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product1._id, quantity: 2 });

    expect(addRes1.status).toBe(200);
    expect(addRes1.body.data.items.length).toBe(1);
    expect(addRes1.body.data.totalAmount).toBe(2400);

    // Add product2 (qty 1) -> + 300 = 2700
    const addRes2 = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product2._id, quantity: 1 });

    expect(addRes2.status).toBe(200);
    expect(addRes2.body.data.items.length).toBe(2);
    expect(addRes2.body.data.totalAmount).toBe(2700);
  });

  it('should increment quantity when adding the same product again', async () => {
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product1._id, quantity: 1 });

    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product1._id, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].quantity).toBe(3);
    expect(res.body.data.totalAmount).toBe(3600);
  });

  it('should reject adding quantity that exceeds product stock', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product1._id, quantity: 10 }); // stock is only 5

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/stock/i);
  });

  it('should change product quantities in cart', async () => {
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product1._id, quantity: 1 });

    const updateRes = await request(app)
      .put(`/api/cart/${product1._id}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 4 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.items[0].quantity).toBe(4);
    expect(updateRes.body.data.totalAmount).toBe(4800);
  });

  it('should remove items from the cart', async () => {
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product1._id, quantity: 1 });

    const delRes = await request(app)
      .delete(`/api/cart/${product1._id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.data.items.length).toBe(0);
    expect(delRes.body.data.totalAmount).toBe(0);
  });
});
