import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Authentication & User Management API', () => {
  const sampleUser = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password123'
  };

  it('should register a new customer successfully with hashed password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(sampleUser.email);
    expect(res.body.data.user.role).toBe('customer');
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject registration if email is already taken', async () => {
    await request(app).post('/api/auth/register').send(sampleUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with invalid email or short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'A',
        email: 'invalid-email',
        password: '123'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should log in an existing user with valid credentials and return JWT', async () => {
    await request(app).post('/api/auth/register').send(sampleUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: sampleUser.email,
        password: sampleUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(sampleUser.email);
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(sampleUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: sampleUser.email,
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should retrieve current user profile with valid Bearer token', async () => {
    const regRes = await request(app).post('/api/auth/register').send(sampleUser);
    const token = regRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(sampleUser.email);
  });

  it('should reject access to profile with missing or invalid token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);

    const resInvalid = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid_garbage_token');
    expect(resInvalid.status).toBe(401);
  });
});
