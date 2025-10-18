'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';

import { register, type RegisterActionState } from '../actions';
import { toast } from '@/components/toast';
import { useSession } from 'next-auth/react';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: 'idle',
    },
  );

  const { update: updateSession, status } = useSession();

  // Handle form submission states
  useEffect(() => {
    if (!state || !state.status || state.status === 'idle') return;
    if (state.status === 'in_progress') {
      setIsProcessing(true);
      setShowSpinner(true);
    } else {
      setIsProcessing(false);
      setShowSpinner(false);
      if (state.status === 'success' && !isSuccessful) {
        toast({
          type: 'success',
          description: 'Account created! Redirecting to login...',
        });
        setIsSuccessful(true);
        // Remove error param from URL
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('error');
          window.history.replaceState(
            {},
            document.title,
            url.pathname + url.search,
          );
        }
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (state.status === 'user_exists' && !isSuccessful) {
        toast({
          type: 'error',
          description: 'An account with this email already exists.',
        });
      } else if (state.status === 'failed' && !isSuccessful) {
        toast({
          type: 'error',
          description: state.error || 'Registration failed. Please try again.',
        });
      } else if (state.status === 'invalid_data' && !isSuccessful) {
        toast({
          type: 'error',
          description: 'Please enter a valid email and password.',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.status, state?.error, isSuccessful]);

  const handleSubmit = async (formData: FormData) => {
    if (isProcessing) return;

    if (!agreed) {
      toast({
        type: 'error',
        description:
          'You must agree to the Privacy Policy and Terms of Service.',
      });
      return;
    }
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  const handleGoogleSignIn = () => {
    if (isProcessing) return;

    if (!agreed) {
      toast({
        type: 'error',
        description:
          'You must agree to the Privacy Policy and Terms of Service.',
      });
      return;
    }
    // Use next-auth signIn for Google with redirect
    import('next-auth/react').then(({ signIn }) =>
      signIn('google', { callbackUrl: 'https://solaceai.xyz', redirect: true }),
    );
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      {showSpinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="animate-spin rounded-full size-16 border-b-2 border-gray-200" />
        </div>
      )}
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign Up</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Create an account with your email and password
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful} disabled={isProcessing}>
            {isProcessing ? 'Creating account...' : 'Sign Up'}
          </SubmitButton>
          <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 mt-2">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="accent-black dark:accent-white"
              disabled={isProcessing}
            />
            I agree to the{' '}
            <Link href="/privacy" className="underline" target="_blank">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="underline" target="_blank">
              Terms of Service
            </Link>
          </label>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign in
            </Link>
            .
          </p>
        </AuthForm>
        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 h-px bg-gray-300 dark:bg-zinc-700" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-300 dark:bg-zinc-700" />
        </div>
        <button
          type="button"
          disabled={isProcessing}
          style={{
            background: '#232526',
            color: '#fff',
            border: 'none',
            borderRadius: 7,
            padding: '10px 0',
            width: '90%',
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: 1,
            boxShadow: '0 2px 8px rgba(35,37,38,0.10)',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            opacity: isProcessing ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            margin: '0 auto 18px auto',
          }}
          onClick={handleGoogleSignIn}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: 10 }}
          >
            <g clipPath="url(#clip0_13183_10121)">
              <path
                d="M19.8052 10.2309C19.8052 9.5508 19.7491 8.86727 19.629 8.19727H10.2V12.0491H15.6191C15.3952 13.2491 14.6691 14.2873 13.6691 14.9491V17.0491H16.6691C18.3691 15.4991 19.8052 13.1491 19.8052 10.2309Z"
                fill="#4285F4"
              />
              <path
                d="M10.2 20C12.6991 20 14.7691 19.1491 16.2691 17.7491L13.2691 15.6491C12.4691 16.1491 11.4491 16.4491 10.2 16.4491C7.79906 16.4491 5.79906 14.7991 5.06906 12.6491H2.06906V14.7991C3.56906 17.4491 6.66906 20 10.2 20Z"
                fill="#34A853"
              />
              <path
                d="M5.06906 12.6491C4.86906 12.1491 4.74906 11.5991 4.74906 11.0491C4.74906 10.4991 4.86906 9.94906 5.06906 9.44906V7.29906H2.06906C1.46906 8.49906 1.2 9.74906 1.2 11.0491C1.2 12.3491 1.46906 13.5991 2.06906 14.7991L5.06906 12.6491Z"
                fill="#FBBC05"
              />
              <path
                d="M10.2 3.54906C11.5691 3.54906 12.8191 4.04906 13.8191 4.99906L16.3191 2.49906C14.7691 1.04906 12.6991 0 10.2 0C6.66906 0 3.56906 2.54906 2.06906 5.19906L5.06906 7.34906C5.79906 5.19906 7.79906 3.54906 10.2 3.54906Z"
                fill="#EA4335"
              />
            </g>
            <defs>
              <clipPath id="clip0_13183_10121">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
          {isProcessing ? 'Creating account...' : 'Sign up with Google'}
        </button>
      </div>
    </div>
  );
}
