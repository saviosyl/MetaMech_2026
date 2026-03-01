import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Access the shared OTP store
function getOtpStore(): Map<string, { code: string; expires: number }> {
  return (globalThis as any).__simStudioOtps || new Map();
}

// Simple JWT-like token (replace with proper JWT in production)
function generateSessionToken(email: string): string {
  const payload = JSON.stringify({ email: email.toLowerCase(), iat: Date.now(), exp: Date.now() + 7 * 24 * 3600 * 1000 });
  const secret = process.env.SIM_STUDIO_JWT_SECRET || 'metamech-sim-secret-change-me';
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const b64 = Buffer.from(payload).toString('base64url');
  return `${b64}.${hmac}`;
}

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code required.' }, { status: 400 });
    }

    const store = getOtpStore();
    const entry = store.get(email.toLowerCase());

    if (!entry) {
      return NextResponse.json({ error: 'No verification pending. Please login again.' }, { status: 400 });
    }

    if (Date.now() > entry.expires) {
      store.delete(email.toLowerCase());
      return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 });
    }

    if (entry.code !== code) {
      return NextResponse.json({ error: 'Invalid code.' }, { status: 401 });
    }

    // Code valid — clean up and issue token
    store.delete(email.toLowerCase());
    const token = generateSessionToken(email);

    // Return token — frontend stores it and redirects to simulation studio app
    return NextResponse.json({
      success: true,
      token,
      // The simulation studio app URL (separate deployment)
      redirectUrl: process.env.SIM_STUDIO_APP_URL || 'https://sim.metamechsolutions.com',
    });
  } catch (err) {
    console.error('[SimStudio Verify]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
