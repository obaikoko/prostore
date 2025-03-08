'use server';

import { CartItem } from '@/types/index';

export const addItemToCart = async (data: CartItem) => {
  return {
    success: true,
    message: 'Item added to cart',
    data,
  };
};
