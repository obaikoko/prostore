'use server';

import { prisma } from '@/db/prisma';
import { convertToPlainObject } from '@/lib/utils';
// import { LATEST_PRODUCTS_LIMIT } from '../constants';

export const getLatestProducts = async () => {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return convertToPlainObject(
    products.map((product) => ({
      ...product,
      price: product.price.toString(),
      rating: product.rating.toString(),
    }))
  );
};

export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) return null;

  return {
    ...product,
    price: product.price.toString(),
    rating: product.rating.toString(), // Convert rating to string
  };
};
