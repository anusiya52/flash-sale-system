'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function StockCounter({
  productId,
  initialStock,
}: {
  productId: string;
  initialStock: number;
}) {
  const { data, error } = useSWR(
    `/api/products/${productId}/stock`,
    fetcher,
    {
      fallbackData: { stock: initialStock },
      refreshInterval: 2000,
      revalidateOnFocus: true,
    }
  );

  const stock = data?.stock ?? initialStock;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">Stock:</span>
        <span
          className={`text-2xl font-bold ${
            stock > 10 ? 'text-green-600' : stock > 0 ? 'text-orange-600' : 'text-red-600'
          }`}
        >
          {stock}
        </span>
        {stock === 0 && (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
            Out of Stock
          </span>
        )}
      </div>
      {error && (
        <p className="text-sm text-gray-500 mt-1">Failed to load stock</p>
      )}
    </div>
  );
}