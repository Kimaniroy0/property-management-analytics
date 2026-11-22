import React, { useState } from 'react';
import { Building2, ShieldCheck } from 'lucide-react';
import { authClient } from '../../lib/auth';

export const SignUpView: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signUp.email({ name, email, password });
      if (result.error) {
        setError(result.error.message || 'Unable to create your account.');
        return;
      }

      const sessionResult = await authClient.getSession();
      if (sessionResult.error) {
        setError(sessionResult.error.message || 'Account created, but the session could not be loaded.');
        return;
      }

      if (sessionResult.data?.user) {
        window.location.assign('/');
      } else {
        setMessage('Your account was created. Check your email for verification, then sign in.');
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F3EDE3] px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <header className="mb-7 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#641F2B] text-white shadow-md ring-4 ring-[#FAF8F3]">
            <Building2 className="h-7 w-7 text-[#FAF8F3]" />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-extrabold tracking-tight text-[#252525] sm:text-3xl">
            ESTATE ANALYTICS
          </h1>
          <p className="mt-1 text-sm font-medium text-[#747474]">
            Create an account to manage your properties
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] p-6 shadow-sm"
        >
          <label className="block text-sm font-medium text-[#252525]">
            Full name
            <input
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-[#252525]">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-[#252525]">
            Password
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#DED6C9] bg-white px-3 py-2 text-sm"
            />
          </label>
          {error && <p role="alert" className="text-sm text-[#641F2B]">{error}</p>}
          {message && <p role="status" className="text-sm text-[#164A3A]">{message}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#641F2B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#48151F] disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
          <p className="text-center text-sm text-[#747474]">
            Already registered? <a href="/sign-in" className="font-semibold text-[#641F2B] underline">Sign in</a>
          </p>
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-[#747474]">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#164A3A]" />
          <span>Your account is secured with Neon Auth.</span>
        </p>
      </div>
    </main>
  );
};
