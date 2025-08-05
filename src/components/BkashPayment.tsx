'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

const BkashPayment = () => {
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId || !amount) {
      toast.error('সব তথ্য পূরণ করুন');
      return;
    }

    try {
      setLoading(true);

      // Check if the transaction ID already exists
      const q = query(
        collection(db, 'bkashTransactions'),
        where('transactionId', '==', transactionId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.error('এই Transaction ID আগেই ব্যবহৃত হয়েছে');
        return;
      }

      // Add transaction to Firestore
      await addDoc(collection(db, 'bkashTransactions'), {
        transactionId,
        amount: parseFloat(amount),
        timestamp: serverTimestamp(),
      });

      toast.success('লেনদেন যাচাইয়ের জন্য সফলভাবে জমা হয়েছে');
      setTransactionId('');
      setAmount('');
    } catch (err) {
      console.error(err);
      toast.error('সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E2136E]/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl border-pink-500">
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-[#E2136E]">বিকাশ পেমেন্ট</h2>

          <div className="bg-pink-100 text-sm text-gray-800 p-3 rounded-md">
            <p>➊ বিকাশ অ্যাপে Send Money অপশন দিন।</p>
            <p>➋ এই নাম্বারে পাঠান: <strong className="text-[#E2136E]">01XXXXXXXXX</strong></p>
            <p>➌ এমাউন্ট: <strong>{amount || 'আপনার পছন্দসই এমাউন্ট'}</strong></p>
            <p>➍ Send করার পর Transaction ID টি নিচে দিন।</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="amount" className="text-[#E2136E]">Amount (৳)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="উদাহরণ: ১০০"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="txnId" className="text-[#E2136E]">Transaction ID</Label>
              <Input
                id="txnId"
                type="text"
                placeholder="উদাহরণ: 5K8XY12R3F"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E2136E] hover:bg-[#c60e60] text-white font-semibold"
            >
              {loading ? 'পাঠানো হচ্ছে...' : 'পাঠিয়ে দিন'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BkashPayment;
