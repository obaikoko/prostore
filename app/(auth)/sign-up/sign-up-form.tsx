'use client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { sigUpDefaultValues } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signUpUser } from '@/lib/actions/user.actions';
import { useSearchParams } from 'next/navigation';

const SignUpForm = () => {
  const [data, action] = useActionState(signUpUser, {
    success: false,
    message: '',
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const SignUpButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button disabled={pending} className='w-full' variant='default'>
        {pending ? 'Processing...' : 'Sign Up'}
      </Button>
    );
  };
  return (
    <form action={action}>
      <div className='space-y-6'>
        <div>
          <Input
            id='callbackUrl'
            name='callbackUrl'
            type='hidden'
            value={`${callbackUrl}` || '/'}
          ></Input>
          <Label htmlFor='name'>Full Name</Label>
          <Input
            id='name'
            name='name'
            type='name'
            required
            autoComplete='name'
            defaultValue={sigUpDefaultValues.name}
          ></Input>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            name='email'
            type='email'
            required
            autoComplete='email'
            defaultValue={sigUpDefaultValues.email}
          ></Input>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            name='password'
            type='password'
            required
            autoComplete='password'
            defaultValue={sigUpDefaultValues.password}
          ></Input>
          <Label htmlFor='confirmPassword'>Confirm Password</Label>
          <Input
            id='confirmPassword'
            name='confirmPassword'
            type='password'
            required
            autoComplete='confirmPassword'
            defaultValue={sigUpDefaultValues.confirmPassword}
          ></Input>
        </div>
        <div>
          <SignUpButton />
        </div>
        {data && !data.success && (
          <div className='text-center text-destructive'>{data.message}</div>
        )}
        <div className='text-center text-sm text-muted-foreground'>
          Already have an account?{' '}
          <Link href='/sign-in' target='_self' className='link'>
            Sign In
          </Link>
        </div>
      </div>
    </form>
  );
};

export default SignUpForm;
