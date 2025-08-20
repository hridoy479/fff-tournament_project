'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input'; // Import Input component
import { Label } from '@/components/ui/label'; // Import Label component
import { toast } from 'react-toastify';
import axios from 'axios';
import { auth } from '@/config/firebase'; // Import auth from firebase config

type PaymentMethod = {
  name: string;
  image: string;
  url: string; // This URL will now be for display/selection, not direct redirection
};

export default function AddMoney() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleAddMoneyMethods: PaymentMethod[] = [
    { name: 'bkash', image: '/images/Bkash.png', url: 'bkash-payment' }, // Changed to .png
    { name: 'nagad', image: '/images/Nagad.png', url: 'nagad-payment' } // Changed to .png
  ];

  const handleInitiatePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method.');
      return;
    }
    if (typeof amount !== 'number' || amount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error('You must be logged in to add money.');
        router.push('/login');
        return;
      }
      const idToken = await currentUser.getIdToken();

      const response = await axios.post('/api/payment/initiate', { amount }, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const { paymentUrl } = response.data;
      if (paymentUrl) {
        window.location.href = paymentUrl; // Redirect to UddoktaPay
      } else {
        toast.error('Failed to get payment URL from gateway.');
      }
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pb-14 mt-12">
      <div className="mb-8 w-full max-w-md">
        <Label htmlFor="amount" className="text-lg font-semibold mb-2 block">Enter Amount</Label>
        <Input
          id="amount"
          type="number"
          placeholder="Minimum 100"
          value={amount}
          onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
          min="100"
          className="px-4 py-2 rounded-md border text-base focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
        {handleAddMoneyMethods.map((method) => (
          <Card
            key={method.name}
            onClick={() => setSelectedMethod(method)}
            className={`cursor-pointer transition-all duration-300 w-52 h-52 ${
              selectedMethod?.name === method.name ? 'border-2 border-pink-500 shadow-xl' : 'border'
            }`}
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Image
                src={method.image}
                alt={`${method.name} logo`}
                width={80}
                height={80}
                className="rounded"
              />
              <p className="mt-4 font-semibold text-center capitalize text-lg">{method.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleInitiatePayment}
        className="mt-8 w-full max-w-md py-3 text-lg"
        disabled={loading || !selectedMethod || typeof amount !== 'number' || amount <= 0}
      >
        {loading ? 'Processing...' : 'Add Funds'}
      </Button>
    </div>
  );
}