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
      const userId = `user_${Math.floor(Math.random() * 10000)}`;

      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity: 1 }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage(`Purchase successful! ${data.remainingStock} items remaining`);
      } else {
        setSuccess(false);

        // Handle different error types
        if (response.status === 429) {
          setMessage('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status === 409) {
          setMessage('Sorry, this item is out of stock!');
        } else {
          setMessage(data.message || '❌ Purchase failed. Please try again.');
        }
      }
    } catch (error) {
      setSuccess(false);
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePurchase}
        disabled={loading}
        className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all shadow-lg flex items-center justify-center gap-3 ${loading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl transform hover:-translate-y-1'
          }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Buy Now
          </>
        )}
      </button>

      {message && (
        <div
          className={`mt-4 p-4 rounded-xl border-2 transition-all ${success
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
            }`}
        >
          <div className="flex items-start gap-3">
            {success ? (
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <div className="flex-1">
              <p className="font-semibold text-base">{message}</p>
            </div>
          </div>
        </div>
      )}

      <noscript>
        <div className="mt-4 p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200 text-yellow-800">
          <p className="font-semibold">JavaScript Required</p>
          <p className="text-sm mt-1">
            Please enable JavaScript to complete your purchase. The product information above is still viewable.
          </p>
        </div>
      </noscript>
    </div>
  );
}