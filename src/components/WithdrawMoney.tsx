'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const WithdrawMoney = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingBalance, setFetchingBalance] = useState(true);

  const fetchBalance = async () => {
    if (!user) return;
    setFetchingBalance(true);
    try {
      const token = await user.firebaseUser.getIdToken();
      const res = await fetch('/api/user/balance', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch balance', error);
      toast.error('Failed to fetch balance');
    } finally {
      setFetchingBalance(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount) return;

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const token = await user.firebaseUser.getIdToken();
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: withdrawAmount }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Withdrawal successful');
        setAmount('');
        fetchBalance(); // Refresh balance after withdrawal
      } else {
        toast.error(data.message || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Withdrawal error', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Withdraw Money</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your current balance</p>
            {fetchingBalance ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
            )}
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount to withdraw
              </label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 50"
                required
                min="1"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Withdraw'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawMoney;
