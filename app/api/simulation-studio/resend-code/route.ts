import { NextResponse } from 'next/server';
import crypto from 'crypto';

function getOtpStore(): Map<string, { code: string; expires: number }> {
  return (globalThis as any).__simStudioOtps || new Map();
}

function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendVerificationEmail(email: string, code: string) {
  // TODO: Replace with real email provider
  console.log(`\n🔐 [SimStudio OTP Resend] ${email}: ${code}\n`);
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required.' }, { status: 400 });
    }

    const store = getOtpStore();
    const code = generateCode();
    store.set(email.toLowerCase(), { code, expires: Date.now() + 10 * 60 * 1000 });
    await sendVerificationEmail(email, code);

    return NextResponse.json({ success: true, message: 'New code sent.' });
  } catch (err) {
    console.error('[SimStudio Resend]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
