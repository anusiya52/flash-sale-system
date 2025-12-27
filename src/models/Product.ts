import { ObjectId } from 'mongodb';

export interface Product {
  _id?: ObjectId;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}