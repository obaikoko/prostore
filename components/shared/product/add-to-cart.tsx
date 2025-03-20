'use client';

import { CartItem, Cart } from '@/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.action';
import { useTransition } from 'react';

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (!res?.success) {
        toast.error(res?.message);
        return;
      }

      toast.success(`${res.message} `, {
        action: {
          label: 'Go To Cart',
          onClick: () => router.push('/cart'),
        },
      });
    });
  };

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);
      toast.info(res.message);
      return;
    });
  };
  // check if item is in cart
  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  return existItem ? (
    <div className='flex justify-center items-center'>
      <Button type='button' variant='outline' onClick={handleRemoveFromCart}>
        {isPending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Minus className='h-4 w-4' />
        )}
      </Button>
      <span className='px-2'>{existItem.qty}</span>
      <Button type='button' variant='outline' onClick={handleAddToCart}>
        {isPending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Plus className='h-4 w-4' />
        )}
      </Button>
    </div>
  ) : (
    <div className='flex-center'>
      <Button className='w-full' type='button' onClick={handleAddToCart}>
        {isPending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Plus className='h-4 w-4' />
        )}
        Add To Cart
      </Button>
    </div>
  );
};

export default AddToCart;
