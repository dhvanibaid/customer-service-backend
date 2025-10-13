"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2 } from 'lucide-react';

interface PaymentDialogProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentDialog({ amount, onSuccess, onCancel }: PaymentDialogProps) {
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePayment = async () => {
    if (!cardNumber || !expiryDate || !cvv) {
      return;
    }

    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProcessing(false);
    onSuccess();
  };

  return (
    <Card className="p-6 bg-slate-800 border-slate-700 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center mx-auto mb-3">
          <CreditCard className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Payment</h2>
        <p className="text-3xl font-bold text-teal-400">₹{amount}</p>
        <p className="text-sm text-slate-400 mt-1">Service charges</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="card-number" className="text-slate-400">Card Number</Label>
          <Input
            id="card-number"
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))}
            className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
            maxLength={16}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiry" className="text-slate-400">Expiry Date</Label>
            <Input
              id="expiry"
              type="text"
              placeholder="MM/YY"
              value={expiryDate}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 2) {
                  setExpiryDate(value);
                } else {
                  setExpiryDate(value.slice(0, 2) + '/' + value.slice(2, 4));
                }
              }}
              className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
              maxLength={5}
            />
          </div>
          <div>
            <Label htmlFor="cvv" className="text-slate-400">CVV</Label>
            <Input
              id="cvv"
              type="password"
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
              className="mt-1 bg-slate-700 border-slate-600 text-slate-100"
              maxLength={3}
            />
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <Button
            onClick={handlePayment}
            disabled={processing || !cardNumber || !expiryDate || !cvv}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₹${amount}`
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={processing}
            className="w-full border-slate-600"
          >
            Cancel
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          This is a demo payment. No actual charges will be made.
        </p>
      </div>
    </Card>
  );
}