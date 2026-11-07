import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';

const seedData = async () => {
  try {
    console.log('[Seeder] Connecting to database...');
    await connectDB();

    console.log('[Seeder] Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({})
    ]);

    console.log('[Seeder] Creating users...');
    const admin = await User.create({
      name: 'Shashwat Admin',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin'
    });

    const customer = await User.create({
      name: 'Priya Sharma',
      email: 'customer@example.com',
      password: 'Customer@123',
      role: 'customer'
    });

    const customer2 = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@example.com',
      password: 'Customer@123',
      role: 'customer'
    });

    console.log('[Seeder] Users created:');
    console.log('   Admin:    admin@example.com / Admin@123');
    console.log('   Customer: customer@example.com / Customer@123');

    console.log('[Seeder] Seeding products...');
    const products = await Product.create([
      {
        name: 'Wireless Earbuds Pro',
        description: 'Active Noise Cancelling earbuds with immersive transparency mode, dynamic head tracking, and up to 30 hours of battery life with wireless charging case.',
        price: 1299,
        category: 'Audio',
        stock: 3,
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80'
      },
      {
        name: 'USB-C Hub 7-in-1 Multiport Adapter',
        description: 'Multiport adapter featuring 4K HDMI, 100W Power Delivery, SD/TF Card Reader, and 3 high-speed USB 3.0 data ports in sleek aluminum casing.',
        price: 899,
        category: 'Accessories',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80'
      },
      {
        name: 'Ergonomic Aluminum Laptop Stand',
        description: 'Heavy-duty foldable aluminum laptop riser with 6-level angle adjustments and heat dissipation ventilation for 10-17 inch notebooks.',
        price: 999,
        category: 'Office',
        stock: 2,
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80'
      },
      {
        name: 'Ultra High-Speed HDMI Cable 2m (8K 60Hz / 4K 120Hz)',
        description: 'Certified 48Gbps braided nylon HDMI 2.1 cable supporting eARC, Dolby Vision, HDR10+ and ultra-low latency gaming.',
        price: 500,
        category: 'Electronics',
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
      },
      {
        name: 'Desk Pad XL Gaming & Office Mouse Pad',
        description: 'Extended 900x400mm waterproof micro-textured cloth surface with stitched non-fray edges and anti-slip natural rubber base.',
        price: 249,
        category: 'Accessories',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600&auto=format&fit=crop&q=80'
      },
      {
        name: 'Mechanical RGB Gaming Keyboard',
        description: 'Compact mechanical keyboard with hot-swappable tactile switches, per-key RGB backlighting, and detachable braided Type-C cable.',
        price: 2499,
        category: 'Electronics',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80'
      },
      {
        name: 'Smart Fitness Tracker Watch',
        description: 'AMOLED display smartwatch with 24/7 heart rate monitoring, SpO2 sensor, sleep tracking, 5ATM water resistance, and 14-day battery life.',
        price: 1899,
        category: 'Wearables',
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80'
      },
      {
        name: 'Fast Wireless Charging Pad 15W',
        description: 'Qi-certified ultra-thin wireless charger with intelligent temperature control and foreign object detection for Qi-enabled devices.',
        price: 699,
        category: 'Accessories',
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=600&auto=format&fit=crop&q=80'
      }
    ]);

    console.log(`[Seeder] Seeded ${products.length} products.`);

    console.log('[Seeder] Creating sample orders...');
    await Order.create([
      {
        customer: customer._id,
        items: [
          {
            product: products[0]._id,
            name: products[0].name,
            price: products[0].price,
            quantity: 1,
            imageUrl: products[0].imageUrl
          }
        ],
        totalAmount: 1299,
        orderStatus: 'Pending',
        shippingAddress: {
          street: '45 Lake View Residency',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India'
        }
      },
      {
        customer: customer2._id,
        items: [
          {
            product: products[2]._id,
            name: products[2].name,
            price: products[2].price,
            quantity: 1,
            imageUrl: products[2].imageUrl
          }
        ],
        totalAmount: 999,
        orderStatus: 'Shipped',
        shippingAddress: {
          street: '12 Green Park',
          city: 'New Delhi',
          state: 'Delhi',
          zipCode: '110016',
          country: 'India'
        }
      },
      {
        customer: customer._id,
        items: [
          {
            product: products[3]._id,
            name: products[3].name,
            price: products[3].price,
            quantity: 1,
            imageUrl: products[3].imageUrl
          }
        ],
        totalAmount: 500,
        orderStatus: 'Delivered',
        shippingAddress: {
          street: '45 Lake View Residency',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India'
        }
      }
    ]);

    console.log('[Seeder] Initial customer cart setup...');
    await Cart.create({
      user: customer._id,
      items: [
        {
          product: products[1]._id,
          quantity: 1
        }
      ]
    });

    console.log('[Seeder] Database seeding successfully completed!');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error] Failed to seed database:', error);
    await disconnectDB();
    process.exit(1);
  }
};

seedData();
