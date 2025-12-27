'use client';

import { useState } from 'react';

export default function PurchaseButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState<boolean | null>(null);

  const handlePurchase = async () => {
    setLoading(true);
    setMessage('');
    setSuccess(null);

    try {
      const userId = `user_${Math.floor(Math.random() * 1000)}`;

      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity: 1 }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage(`Purchase successful! ${data.remainingStock} items left`);
      } else {
        setSuccess(false);
        setMessage(data.message || 'Purchase failed');
      }
    } catch (error) {
      setSuccess(false);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePurchase}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Processing...' : 'Buy Now'}
      </button>

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            success
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}