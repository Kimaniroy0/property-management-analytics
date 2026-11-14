import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRemoteJWKSet, errors as joseErrors, jwtVerify } from 'jose';
import type { PoolClient } from '@neondatabase/serverless';
import { pool } from '../lib/db.js';

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;
let issuer: string | undefined;

function getTokenVerifier(): { jwks: ReturnType<typeof createRemoteJWKSet>; issuer: string } | null {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
  if (!baseUrl || !jwksUrl) return null;

  if (!jwks || !issuer) {
    try {
      issuer = new URL(baseUrl).origin;
      jwks = createRemoteJWKSet(new URL(jwksUrl));
    } catch (error) {
      console.error('Neon Auth verification URLs are invalid:', error);
      return null;
    }
  }

  return { jwks, issuer };
}

export async function getAuthenticatedUserId(
  req: VercelRequest,
  res: VercelResponse
): Promise<string | null> {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return null;
  }

  const verifier = getTokenVerifier();
  if (!verifier) {
    console.error('NEON_AUTH_BASE_URL and NEON_AUTH_JWKS_URL must be configured.');
    res.status(500).json({ error: 'Authentication is not configured on the server.' });
    return null;
  }

  try {
    const { payload } = await jwtVerify(authorization.slice('Bearer '.length), verifier.jwks, {
      issuer: verifier.issuer,
    });
    if (typeof payload.sub !== 'string' || !payload.sub) {
      res.status(401).json({ error: 'Unauthorized: Token has no user identity' });
      return null;
    }
    return payload.sub;
  } catch (error) {
    if (error instanceof joseErrors.JOSEError) {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return null;
    }
    console.error('Neon Auth token verification failed:', error);
    res.status(500).json({ error: 'Unable to verify the authentication token.' });
    return null;
  }
}

export async function withUserDatabase<T>(
  neonUserId: string,
  operation: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(
      "SELECT set_config('app.user_id', $1, true)",
      [neonUserId]
    );
    await client.query(
      'INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
      [neonUserId]
    );

    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
