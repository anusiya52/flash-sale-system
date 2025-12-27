import Link from 'next/link';
import { getDb } from '@/lib/db';

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
    imageUrl: p.imageUrl,
  }));
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Flash Sale</h1>
        <Link
          href="/admin"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
        >
          📊 Admin Dashboard
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square bg-gray-200 rounded-md mb-4 flex items-center justify-center">
              <span className="text-gray-500">Image</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-2xl font-bold text-blue-600">${product.price}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}