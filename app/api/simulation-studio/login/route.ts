import { NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory OTP store (replace with Redis/DB in production)
const otpStore = new Map<string, { code: string; expires: number }>();
(globalThis as any).__simStudioOtps = otpStore;

function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendVerificationEmail(email: string, code: string) {
  // TODO: Replace with real email provider (Resend, SendGrid, Nodemailer)
  // Example:
  //   await resend.emails.send({
  //     from: 'MetaMech <noreply@metamechsolutions.com>',
  //     to: email,
  //     subject: 'Simulation Studio Login Code',
  //     html: `<h2>Your login code: ${code}</h2><p>Expires in 10 minutes.</p>`
  //   });
  console.log(`\n🔐 [SimStudio OTP] ${email}: ${code}\n`);
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
    }

    // --- PREMIUM PLUS CHECK ---
    // Production: query your DB for user with premium_plus subscription
    //   const user = await db.query('SELECT * FROM users WHERE email=$1 AND tier=$2', [email, 'premium_plus']);
    //   if (!user) return 403;
    //   if (!await bcrypt.compare(password, user.password_hash)) return 401;
    //
    // Dev/MVP: use env vars
    const allowed = process.env.SIM_STUDIO_ALLOWED_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    const masterPw = process.env.SIM_STUDIO_MASTER_PASSWORD || 'MetaMech2026!';

    if (allowed.length > 0 && !allowed.includes(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'This email is not linked to a Premium Plus subscription.' },
        { status: 403 }
      );
    }

    if (password !== masterPw) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Generate OTP and send
    const code = generateCode();
    otpStore.set(email.toLowerCase(), { code, expires: Date.now() + 10 * 60 * 1000 });
    await sendVerificationEmail(email, code);

    return NextResponse.json({ success: true, message: 'Verification code sent.' });
  } catch (err) {
    console.error('[SimStudio Login]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
