import { createAuthClient } from '@neondatabase/auth';
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters';

export const neonAuthUrl = import.meta.env.VITE_NEON_AUTH_URL;

export const authClient = createAuthClient(
  neonAuthUrl || window.location.origin,
  {
    adapter: BetterAuthReactAdapter({
      fetchOptions: { credentials: 'include' },
    }),
  }
);

export async function getAuthToken(): Promise<string> {
  let token: string | null = null;
  const { data, error } = await authClient.getSession({
    fetchOptions: {
      headers: { 'X-Force-Fetch': 'true' },
      onSuccess: ({ response }) => {
        token = response.headers.get('set-auth-jwt');
      },
    },
  });
  if (error) {
    throw new Error(error.message || 'Could not load the authenticated Neon Auth session.');
  }
  if (!data?.session) {
    throw new Error('No authenticated Neon Auth session is available.');
  }
  if (!token) {
    throw new Error('Neon Auth did not provide a JWT for the current session.');
  }
  return token;
}
