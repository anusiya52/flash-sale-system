import Link from 'next/link';
import { getDb } from '@/lib/db';
import Image from 'next/image';

export const dynamic = 'force-static';
export const revalidate = 60;

async function getProducts() {
  const db = await getDb();
  const products = await db
    .collection('products')
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return products.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    price: p.price,
    stock: p.stock,
    imageUrl: p.imageUrl,
  }));
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-12">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-bold mb-3 flex items-center gap-3 justify-center md:justify-start">
                ⚡ Flash Sale
              </h1>
            </div>
            <Link
              href="/admin"
              className="group bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Admin Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => {
            const stockStatus = product.stock > 10
              ? { label: 'In Stock', color: 'from-green-500 to-emerald-500', bg: 'bg-green-100', text: 'text-green-700' }
              : product.stock > 0
                ? { label: `Only ${product.stock} left!`, color: 'from-orange-500 to-red-500', bg: 'bg-orange-100', text: 'text-orange-700' }
                : { label: 'Out of Stock', color: 'from-gray-500 to-gray-600', bg: 'bg-gray-100', text: 'text-gray-700' };

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-gray-100 hover:border-blue-200">
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                    <div className={`absolute top-4 right-4 ${stockStatus.bg} ${stockStatus.text} px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10`}>
                      {stockStatus.label}
                    </div>

                    <div className="relative aspect-square w-full max-w-md rounded-2xl overflow-hidden bg-white shadow-lg group">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                          priority
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                          <div className="text-gray-400 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                      <span className="text-white font-semibold text-lg flex items-center gap-2">
                        View Details
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h2>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                          ${product.price}
                        </p>
                      </div>

                      <div className={`p-3 rounded-xl bg-gradient-to-r ${stockStatus.color}`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>

                    <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2">
                      <span>Shop Now</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}