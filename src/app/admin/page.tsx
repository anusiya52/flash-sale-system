'use client';

import useSWR from 'swr';
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

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminPage() {
  const { data: stats, error, isLoading, mutate } = useSWR<Stats>(
    '/api/admin/stats',
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      keepPreviousData: true,
      dedupingInterval: 5000,
    }
  );

  function AnimatedNumber({
    value,
    prefix = '',
    suffix = '',
    className = ''
  }: {
    value: number;
    prefix?: string;
    suffix?: string;
    className?: string;
  }) {
    return (
      <span className={className}>
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </span>
    );
  }

  const handleRefresh = () => {
    mutate();
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">Loading statistics...</p>
            <p className="text-sm text-gray-500 mt-2">Fetching real-time data</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-lg">Failed to load statistics</span>
            </div>
            <p className="mt-3 text-sm">Please check your connection and try again.</p>
            <button
              onClick={() => mutate()}
              className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const maxRevenue = Math.max(...(stats?.revenueByDay?.map(d => d.revenue) || [1]));

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-12">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
                  Admin Dashboard
                </h1>
                <div className="relative group">
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    Live updates enabled
                  </div>
                </div>
              </div>
              <p className="text-blue-100">Real-time sales analytics and insights</p>
            </div>
            <Link
              href="/"
              className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Store
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                Total Revenue
              </h3>
              <div className="bg-green-100 p-3 rounded-xl animate-pulse">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <AnimatedNumber
              value={stats?.totalRevenue || 0}
              prefix="$"
              className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"
            />
            <p className="text-sm text-gray-500 mt-2">All-time earnings</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                Total Units Sold
              </h3>
              <div className="bg-blue-100 p-3 rounded-xl animate-pulse">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <AnimatedNumber
              value={stats?.totalUnits || 0}
              className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
            />
            <p className="text-sm text-gray-500 mt-2">Products delivered</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Top Selling Products</h2>
              </div>
              <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Last 7 days
              </div>
            </div>

            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => {
                  const colors = [
                    'from-yellow-400 to-orange-500',
                    'from-gray-400 to-gray-500',
                    'from-amber-600 to-orange-700'
                  ];
                  const badges = ['🥇', '🥈', '🥉'];

                  return (
                    <div
                      key={product._id}
                      className="group p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl" style={{ animationDelay: `${index * 100}ms` }}>
                            {badges[index]}
                          </span>
                          <div>
                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                              {product.productName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              <AnimatedNumber value={product.quantitySold} suffix=" units sold" />
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${colors[index]}`}>
                            {product.quantitySold}
                          </div>
                          <div className="text-xs text-gray-400 uppercase tracking-wide">units</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 font-medium">No sales data available yet</p>
                <p className="text-sm text-gray-400 mt-1">Start making sales to see top products</p>
              </div>
            )}
          </div>

          {/* Revenue by Day */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Revenue by Day</h2>
              </div>
            </div>

            {stats?.revenueByDay && stats.revenueByDay.length > 0 ? (
              <div className="space-y-3">
                {stats.revenueByDay.map((day) => {
                  const percentage = (day.revenue / maxRevenue) * 100;

                  return (
                    <div key={day._id} className="group animate-fade-in">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">{day._id}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            <AnimatedNumber value={day.orders} suffix={` order${day.orders !== 1 ? 's' : ''}`} />
                          </span>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          <AnimatedNumber value={day.revenue} prefix="$" />
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out group-hover:from-blue-600 group-hover:to-purple-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 font-medium">No revenue data for the last 7 days</p>
                <p className="text-sm text-gray-400 mt-1">Sales will appear here</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleRefresh}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-3 mx-auto"
          >
            <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Statistics
          </button>
          <div className="text-sm text-gray-500 mt-3 flex items-center justify-center gap-2">
            <span>Last updated: <span className="font-semibold text-gray-700">
              {stats?.generatedAt ? new Date(stats.generatedAt).toLocaleTimeString() : 'N/A'}
            </span></span>
          </div>
        </div>
      </div>
    </main>
  );
}

