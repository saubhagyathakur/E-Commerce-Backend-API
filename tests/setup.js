import { beforeAll, afterAll, beforeEach } from 'vitest';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { Cart } from '../src/models/Cart.js';
import { Order } from '../src/models/Order.js';

const TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/ecom_test_db';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB(TEST_MONGO_URI);
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({})
  ]);
});

afterAll(async () => {
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({})
  ]);
  await disconnectDB();
});
