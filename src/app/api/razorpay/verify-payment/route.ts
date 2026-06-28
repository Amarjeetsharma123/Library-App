import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, fineId } = await req.json();

    // Verify the payment signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Signature verified — mark fine as paid in database
    await db.fine.update({
      where: { id: fineId },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: 'Fine paid successfully' });
  } catch (error) {
    console.error('Razorpay verification failed:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
