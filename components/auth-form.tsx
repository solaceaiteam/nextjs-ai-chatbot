import { signIn } from 'next-auth/react';
import { useState } from 'react';

import { Input } from './ui/input';
import { Label } from './ui/label';

export function AuthForm({
  action,
  children,
  defaultEmail = '',
  mode = 'login',
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
  mode?: 'login' | 'signup';
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [googleError, setGoogleError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setGoogleError('');
      const result = await signIn('google', { callbackUrl: '/' });
      if (result?.error) {
        setGoogleError('Google sign-in failed. Please try again.');
      }
    } catch (error) {
      setGoogleError('Google sign-in failed. Please try again.');
      console.error('Google sign-in error:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    if (typeof action === 'function') {
      action(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-base h-14 rounded-lg border border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20"
          type="email"
          placeholder="user@acme.com"
          autoComplete="email"
          required
          autoFocus
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Password
        </Label>
        <Input
          id="password"
          name="password"
          className="bg-muted text-md md:text-base h-14 rounded-lg border border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20"
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      {children}
    </form>
  );
}
