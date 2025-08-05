'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type PaymentMethod = {
  name: string;
  image: string;
  url: string;
};

export default function AddMoney({ onSelect }: { onSelect: (method: string) => void }) {
  const [selected, setSelected] = useState('');
  const router = useRouter();

  const handleAddMoney: PaymentMethod[] = [
    { name: 'bkash', image: '/images/bkash.png', url: '/bkash-payment' },
    { name: 'nagad', image: '/images/nagad.png', url: '/nagad-payment' }
  ];

  const handleSelect = (method: PaymentMethod) => {
    setSelected(method.name);
    onSelect(method.name);
    router.push(method.url);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-12 items-center justify-center pb-14">
      {handleAddMoney.map((method) => (
        <Card
          key={method.name}
          onClick={() => handleSelect(method)}
          className={`cursor-pointer transition-all duration-300 w-52 h-52 ${
            selected === method.name ? 'border-2 border-pink-500 shadow-xl' : 'border'
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
  );
}
