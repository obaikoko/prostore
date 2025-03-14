'use server';
import { cookies } from 'next/headers';
import { CartItem } from '@/types/index';
import { convertToPlainObject, formatError } from '../utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { cartItemSchema } from '../validators';

export const addItemToCart = async (data: CartItem) => {
  try {
    // Check for Cart Cookie
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;
    if (!sessionCartId) {
      throw new Error('Session Cart Id not found');
    }

    // Get session and user ID
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;
    // const cart = await getMyCart();

    // Parse and validate item

    const item = cartItemSchema.parse(data);
    // Get product from DB
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });

    console.log({
      sessionCartId: sessionCartId,
      userId: userId,
      itemRequested: item,
      productFound: product,
    });
    return {
      success: true,
      message: 'Item added to cart',
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
};

export const getMyCart = async () => {
  // Check for Cart Cookie
  const sessionCartId = (await cookies()).get('sessionCartId')?.value;
  if (!sessionCartId) {
    throw new Error('Session Cart Id not found');
  }

  // Get session and user ID
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  // get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) {
    return undefined;
  }

  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
  });
};
