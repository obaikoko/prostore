'use server';
import { cookies } from 'next/headers';
import { CartItem } from '@/types/index';
import { convertToPlainObject, formatError } from '../utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { cartItemSchema, insertCartSchema } from '../validators';
import { round2 } from '../utils';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
  );
  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
  const taxPrice = round2(itemsPrice * 0.15);
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export const addItemToCart = async (data: CartItem) => {
  try {
    // check for cookies
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;
    if (!sessionCartId) throw new Error('Session cart not found');
    // Get session UserID

    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // get cart
    const cart = await getMyCart();

    // Parse and validate items
    const item = cartItemSchema.parse(data);

    // find product in DB
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });

    if (!product) throw new Error('Product not found');
    if (!cart) {
      // Create new cart
      const newCart = insertCartSchema.parse({
        sessionCartId: sessionCartId,
        userId: userId,
        items: [item],
        ...calcPrice([item]),
      });

      // Add to DB
      await prisma.cart.create({
        data: newCart,
      });

      // revalidate product page
      revalidatePath(`/product/${product.slug}`);
      return {
        success: true,
        message: `${product.name} added to cart`,
        data,
      };
    } else {
      // check if item is already in the cart
      // Check if item is already in cart
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );

      if (existItem) {
        // Check stock
        if (product.stock < existItem.qty + 1) {
          throw new Error('Not enough stock');
        }

        // Increase the quantity
        (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        )!.qty = existItem.qty + 1;
      } else {
        // If item does not exist in cart
        // Check stock
        if (product.stock < 1) throw new Error('Not enough stock');

        // Add item to the cart.items
        cart.items.push(item);
      }

      // Save to database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${
          existItem ? 'updated in' : 'added to'
        } cart`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
};

export const getMyCart = async () => {
  // check for cookies
  const sessionCartId = (await cookies()).get('sessionCartId')?.value;
  if (!sessionCartId) throw new Error('Session cart not found');

  // get session and User ID
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  // get user Cart from DB
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  // convert to decimals and returm

  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
  });
};

export const removeItemFromCart = async (productId: string) => {
  try {
    // check for cookies
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;
    if (!sessionCartId) throw new Error('Session cart not found');

    const product = await prisma.product.findFirst({
      where: { id: productId },
    });

    if (!product) throw new Error('Product not found');
    // Get user Cart
    const cart = await getMyCart();
    if (!cart) throw new Error('Cart not found');
    // check for item in cart
    const exist = (cart.items as CartItem[]).find(
      (x) => x.productId === productId
    );
    if (!exist) throw new Error('Item not found in cart');

    // check if only one in the quantity
    if (exist.qty === 1) {
      // remove item from cart
      cart.items = (cart.items as CartItem[]).filter(
        (x) => x.productId !== productId
      );
    } else {
      // decrease quantity
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty =
        exist.qty - 1;
    }

    // Save to database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      }
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} removed from cart`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
};
