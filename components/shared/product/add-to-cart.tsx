'use client';

import { CartItem } from '@/types/index';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner'; // ✅ Use Sonner
import { addItemToCart } from '@/lib/actions/cart.action';

const AddToCart = ({ item }: { item: CartItem }) => {
  const router = useRouter();

  const handleAddToCart = async () => {
    const res = await addItemToCart(item);

    if (!res?.success) {
      toast.error(res?.message); 
      return;
    }

    // ✅ Correct way to show a success toast with a button
    toast.success(`${item.name} added to cart`, {
      action: {
        label: 'Go To Cart',
        onClick: () => router.push('/cart'),
      },
    });
  };

  return (
    <div className='flex-center'>
      <Button className='w-full' type='button' onClick={handleAddToCart}>
        <Plus/>Add To Cart
      </Button>
    </div>
  );
};

export default AddToCart;
