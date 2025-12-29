import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const ordersCollection = db.collection('orders');

    const [stats] = await ordersCollection.aggregate([
      {
        $facet: {
          totals: [
            {
              $match: { status: 'completed' }
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                totalUnits: { $sum: '$quantity' }
              }
            }
          ],
          
          topProducts: [
            {
              $match: { status: 'completed' }
            },
            {
              $group: {
                _id: '$productId',
                productName: { $first: '$productName' },
                quantitySold: { $sum: '$quantity' }
              }
            },
            {
              $sort: { quantitySold: -1 }
            },
            {
              $limit: 3
            }
          ],
          
          revenueByDay: [
            {
              $match: {
                status: 'completed',
                createdAt: {
                  $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
              }
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                revenue: { $sum: '$totalAmount' },
                orders: { $sum: 1 }
              }
            },
            {
              $sort: { _id: 1 }
            }
          ]
        }
      }
    ]).toArray();

    const response = {
      totalRevenue: stats.totals[0]?.totalRevenue || 0,
      totalUnits: stats.totals[0]?.totalUnits || 0,
      topProducts: stats.topProducts,
      revenueByDay: stats.revenueByDay,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}