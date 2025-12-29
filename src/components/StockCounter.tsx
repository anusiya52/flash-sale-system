'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface StockCounterProps {
  productId: string;
  initialStock: number;
  variant?: 'badge' | 'counter';
}

export default function StockCounter({
  productId,
  initialStock,
  variant = 'counter'
}: StockCounterProps) {
  const { data, error } = useSWR(
    `/api/products/${productId}/stock`,
    fetcher,
    {
      fallbackData: { stock: initialStock },
      refreshInterval: 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 500,
    }
  );

  const stock = data?.stock ?? initialStock;

  if (variant === 'badge') {
    return (
      <div className="absolute top-6 right-6 z-10">
        {stock > 10 ? (
          <div
            className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 transition-all duration-300"
            data-stock={stock}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            In Stock
          </div>
        ) : stock > 0 ? (
          <div
            className={`bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all duration-300 ${stock <= 3 ? 'animate-pulse' : ''}`}
            data-stock={stock}
          >
            🔥 Only {stock} left!
          </div>
        ) : (
          <div
            className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all duration-300"
            data-stock={stock}
          >
            Out of Stock
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-lg font-semibold text-gray-700">Available Stock:</span>
        <div className="flex items-center gap-2">
          <span
            className={`text-3xl font-bold ${stock > 10
              ? 'text-green-600'
              : stock > 0
                ? 'text-orange-600'
                : 'text-red-600'
              }`}
          >
            {stock}
          </span>
          <span className="text-gray-500">units</span>
        </div>

        {stock === 0 && (
          <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-bold">
            ❌ Out of Stock
          </span>
        )}
        {stock > 0 && stock <= 5 && (
          <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
            🔥 Hurry! Only {stock} left
          </span>
        )}
        {stock > 5 && stock <= 10 && (
          <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-bold">
            ⚡ Low Stock
          </span>
        )}
        {stock > 10 && (
          <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold">
            ✅ In Stock
          </span>
        )}
      </div>

      {error && (
        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Unable to load live stock. Showing last known: {initialStock}
        </p>
      )}

      <noscript>
        <p className="text-sm text-blue-600 mt-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
          ℹ️ Enable JavaScript for real-time stock updates
        </p>
      </noscript>
    </div>
  );
}