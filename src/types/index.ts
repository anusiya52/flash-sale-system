export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface PurchaseRequest {
  userId: string;
  productId: string;
  quantity: number;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  orderId?: string;
  remainingStock?: number;
}