import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const redis = await getRedisClient();
    const stockKey = `stock:${params.id}`;

    let stock = await redis.get(stockKey);

    if (stock === null) {
      const db = await getDb();
      const product = await db.collection('products').findOne({
        _id: new ObjectId(params.id)
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      stock = product.stock.toString();
      await redis.set(stockKey, stock, { EX: 300 });
    }

    return NextResponse.json({ stock: parseInt(stock) });
  } catch (error) {
    console.error('Stock fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock' },
      { status: 500 }
    );
  }
}