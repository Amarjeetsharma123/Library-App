'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface RazorpayPayButtonProps {
  fineId: string;
  amount: number; // in USD/INR (not paise)
  userName: string;
  userEmail?: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export default function RazorpayPayButton({ fineId, amount, userName, userEmail = '' }: RazorpayPayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) return resolve(true);
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Payment gateway failed to load. Please try again.');
        setLoading(false);
        return;
      }

      // 2. Create a Razorpay order on our backend
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, fineId }),
      });

      if (!orderRes.ok) {
        setError('Could not create payment order. Please try again.');
        setLoading(false);
        return;
      }

      const { orderId, keyId, currency } = await orderRes.json();

      // 3. Open Razorpay checkout modal
      const options: RazorpayOptions = {
        key: keyId,
        amount: Math.round(amount * 100), // paise
        currency: currency || 'INR',
        name: 'LibSphere Library',
        description: `Late Return Fine Payment`,
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          // 4. Verify the payment on backend
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              fineId,
            }),
          });

          if (verifyRes.ok) {
            setPaid(true);
            setTimeout(() => router.refresh(), 1500);
          } else {
            setError('Payment verification failed. Contact support.');
          }
          setLoading(false);
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: '#6366f1', // Indigo — matches LibSphere brand
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-500 font-semibold text-xs">
        <CheckCircle2 className="h-4 w-4" />
        Payment Successful!
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md disabled:opacity-70 transition-all duration-200 cursor-pointer"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CreditCard className="h-3.5 w-3.5" />
        )}
        {loading ? 'Processing...' : 'Pay via Razorpay'}
      </button>

      {error && (
        <p className="text-xs text-rose-500 mt-1">{error}</p>
      )}

      {/* Trust Badge */}
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70">
        <ShieldCheck className="h-3 w-3 text-emerald-500" />
        Secured by Razorpay
      </span>
    </div>
  );
}
