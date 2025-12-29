import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getRedisClient, DECREMENT_STOCK_SCRIPT } from '@/lib/redis';
import { RateLimiter } from '@/lib/rate-limiter';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, quantity = 1 } = body;

    console.log('Purchase request:', { userId, productId, quantity });

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userRateLimit = await RateLimiter.middleware(userId, 'purchase');
    if (userRateLimit) return userRateLimit;

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const ipRateLimit = await RateLimiter.middleware(ip, 'general');
    if (ipRateLimit) return ipRateLimit;

    const db = await getDb();
    const redis = await getRedisClient();
    const stockKey = `stock:${productId}`;

    const product = await db.collection('products').findOne({
      _id: new ObjectId(productId)
    });

    console.log('Product found:', product?.name);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const currentStock = await redis.get(stockKey);
    console.log('Current Redis stock:', currentStock);

    const result = await redis.eval(DECREMENT_STOCK_SCRIPT, {
      keys: [stockKey],
      arguments: [quantity.toString()],
    });

    console.log('Redis decrement result:', result);

    if (result === -1) {
      console.log('Stock not in cache, syncing...');
      await redis.set(stockKey, product.stock.toString());
      return NextResponse.json(
        { success: false, message: 'Please retry' },
        { status: 503 }
      );
    }

    if (result === -2 || (typeof result === 'number' && result < 0)) {
      console.log('Out of stock');
      return NextResponse.json(
        { success: false, message: 'Out of stock' },
        { status: 409 }
      );
    }

    // Update database without transaction
    try {
      const updateResult = await db.collection('products').findOneAndUpdate(
        {
          _id: new ObjectId(productId),
          stock: { $gte: quantity }
        },
        {
          $inc: { stock: -quantity },
          $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
      );

      console.log('Database update:', updateResult ? 'success' : 'failed');

      if (!updateResult) {
        // Rollback Redis
        await redis.incr(stockKey);
        console.log('Rolled back Redis stock');
        return NextResponse.json(
          { success: false, message: 'Out of stock' },
          { status: 409 }
        );
      }

      // Create order
      const order = {
        userId,
        productId: new ObjectId(productId),
        productName: product.name,
        quantity,
        price: product.price,
        totalAmount: product.price * quantity,
        status: 'completed' as const,
        createdAt: new Date(),
      };

      await db.collection('orders').insertOne(order);
      console.log('Order created');

      const remainingStock = await redis.get(stockKey);

      return NextResponse.json({
        success: true,
        message: 'Purchase successful',
        orderId: new ObjectId().toString(),
        remainingStock: parseInt(remainingStock || '0'),
      });

    } catch (error) {
      // Rollback Redis on any error
      await redis.incr(stockKey);
      console.error('Purchase failed:', error);
      return NextResponse.json(
        { success: false, message: 'Purchase failed, please try again' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}