'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createUser, getUser } from '@/lib/db/queries';
import { signIn, auth } from './auth';

const authFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
  error?: string;
}

export const login = async (
  prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState & { error?: string }> => {
  if (prevState.status === 'in_progress') {
    return prevState;
  }
  try {
    const inProgressState: LoginActionState = { status: 'in_progress' };
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });
    const [dbUser] = await getUser(validatedData.email);
    if (!dbUser) {
      return { status: 'failed', error: 'No account found with this email.' };
    }
    const result = await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });
    await new Promise((resolve) => setTimeout(resolve, 700));
    const session = await auth();
    if (session?.user) {
      return { status: 'success' };
    }
    if (result?.error) {
      console.error('Sign in error:', result.error);
      return { status: 'failed', error: result.error };
    }
    return { status: 'failed', error: 'Unknown login error.' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data', error: error.message };
    }
    console.error('Login error:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
  error?: string;
}

export const register = async (
  prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState & { error?: string }> => {
  if (prevState.status === 'in_progress') {
    return prevState;
  }
  try {
    const inProgressState: RegisterActionState = { status: 'in_progress' };
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });
    const [existingUser] = await getUser(validatedData.email);
    if (existingUser) {
      return { status: 'user_exists', error: 'User already exists.' };
    }
    await createUser(validatedData.email, validatedData.password);
    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data', error: error.message };
    }
    console.error('Registration error:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
