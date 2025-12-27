'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalRevenue: number;
  totalUnits: number;
  topProducts: Array<{
    _id: string;
    productName: string;
    quantitySold: number;
  }>;
  revenueByDay: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
  generatedAt: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/admin/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading statistics...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <Link
          href="/"
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          ← Back to Store
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Total Revenue
          </h3>
          <p className="text-4xl font-bold text-green-600">
            ${stats?.totalRevenue.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Total Units Sold
          </h3>
          <p className="text-4xl font-bold text-blue-600">
            {stats?.totalUnits.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Top 3 Selling Products</h2>
        
        {stats?.topProducts && stats.topProducts.length > 0 ? (
          <div className="space-y-4">
            {stats.topProducts.map((product, index) => (
              <div
                key={product._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-gray-400">
                    #{index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {product.productName}
                    </h3>
                    <p className="text-gray-600">
                      Units Sold: {product.quantitySold}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {product.quantitySold}
                  </div>
                  <div className="text-sm text-gray-500">units</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No sales data available</p>
        )}
      </div>

      {/* Revenue by Day */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Revenue by Day (Last 7 Days)</h2>
        
        {stats?.revenueByDay && stats.revenueByDay.length > 0 ? (
          <div className="space-y-3">
            {stats.revenueByDay.map((day) => (
              <div
                key={day._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{day._id}</h3>
                  <p className="text-sm text-gray-600">
                    {day.orders} order{day.orders !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    ${day.revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No revenue data for the last 7 days</p>
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-8 text-center">
        <button
          onClick={fetchStats}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
        >
          🔄 Refresh Statistics
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Last updated: {stats?.generatedAt ? new Date(stats.generatedAt).toLocaleTimeString() : 'N/A'}
        </p>
      </div>
    </main>
  );
}