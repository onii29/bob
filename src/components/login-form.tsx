'use client';

import React from 'react';
import {useForm} from 'react-hook-form';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

export function LoginForm() {
  const {register, handleSubmit} = useForm<{ email: string; password: string }>();

  function onSubmit(data: { email: string; password: string }) {
    // Dummy login for prototype
    console.log('Logging in with', data);
    window.location.href = '/dashboard';
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input type="email" placeholder="Email" {...register('email', { required: true })} />
      <Input type="password" placeholder="Password" {...register('password', { required: true })} />
      <Button type="submit" className="w-full">Log In</Button>
    </form>
  );
}
