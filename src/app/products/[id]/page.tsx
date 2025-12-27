import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { notFound } from 'next/navigation';
import StockCounter from '@/components/StockCounter';
import PurchaseButton from '@/components/PurchaseButton';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function generateStaticParams() {
  const db = await getDb();
  const products = await db.collection('products').find({}).toArray();
  
  return products.map((product) => ({
    id: product._id.toString(),
  }));
}

async function getProduct(id: string) {
  const db = await getDb();
  const product = await db.collection('products').findOne({
    _id: new ObjectId(id),
  });

  if (!product) return null;

  return {
    id: product._id.toString(),
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    imageUrl: product.imageUrl,
  };
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-xl">Product Image</span>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-6">{product.description}</p>
            
            <div className="mb-6">
              <span className="text-3xl font-bold text-blue-600">
                ${product.price}
              </span>
            </div>

            <StockCounter productId={product.id} initialStock={product.stock} />
            <PurchaseButton productId={product.id} />
          </div>
        </div>
      </div>
    </main>
  );
}