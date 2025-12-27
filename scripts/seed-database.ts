import { MongoClient, ObjectId } from 'mongodb';
import { createClient } from 'redis';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flashsale';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

async function seed() {
  console.log('🌱 Seeding database...');

  const mongoClient = await MongoClient.connect(MONGODB_URI);
  const db = mongoClient.db();

  const redis = createClient({ url: REDIS_URL });
  await redis.connect();

  await db.collection('products').deleteMany({});
  await db.collection('orders').deleteMany({});
  await redis.flushDb();

  const products = [
    {
      _id: new ObjectId('676f00000000000000000001'),
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with titanium design',
      price: 999,
      stock: 10,
      imageUrl: '/images/iphone.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new ObjectId('676f00000000000000000002'),
      name: 'MacBook Pro M3',
      description: 'Powerful laptop for professionals',
      price: 1999,
      stock: 5,
      imageUrl: '/images/macbook.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new ObjectId('676f00000000000000000003'),
      name: 'AirPods Pro',
      description: 'Premium wireless earbuds',
      price: 249,
      stock: 50,
      imageUrl: '/images/airpods.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection('products').insertMany(products);

  for (const product of products) {
    await redis.set(`stock:${product._id}`, product.stock.toString());
  }

  console.log('✅ Database seeded successfully');
  console.log(`📦 Created ${products.length} products`);
  console.log('🎯 Test product ID for stress test: 676f00000000000000000001');

  await mongoClient.close();
  await redis.quit();
}

seed().catch(console.error);