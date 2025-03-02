'use client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { sigInDefaultValues } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const CrendentialsSignInForm = () => {
  return (
    <form action=''>
      <div className='space-y-6'>
        <div>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            name='email'
            type='email'
            required
            autoComplete='email'
            defaultValue={sigInDefaultValues.email}
          ></Input>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            name='password'
            type='password'
            required
            autoComplete='password'
            defaultValue={sigInDefaultValues.password}
          ></Input>
        </div>
        <div>
          <Button className='w-full' variant='default'>
            Sign In
          </Button>
        </div>
        <div className='text-center text-sm text-muted-foreground'>
          Don&apos;t have an account?{' '}
          <Link href='/signup' target='_self' className='link'>
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  );
};

export default CrendentialsSignInForm;
