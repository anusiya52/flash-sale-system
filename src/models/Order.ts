import { ObjectId } from 'mongodb';

export interface Order {
  _id?: ObjectId;
  userId: string;
  productId: ObjectId;
  productName: string;
  quantity: number;
  price: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}