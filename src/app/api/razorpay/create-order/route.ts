import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { amount, fineId } = await req.json();

    if (!amount || !fineId) {
      return NextResponse.json({ error: 'Amount and fineId are required' }, { status: 400 });
    }

    // Amount must be in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `fine_${fineId}_${Date.now()}`,
      notes: {
        fineId,
        purpose: 'Library Fine Payment',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
