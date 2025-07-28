// PaymentMethodSelector.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function PaymentMethodSelector({ onSelect }: { onSelect: (method: string) => void }) {
  const [selected, setSelected] = useState('');

  const handleSelect = (method: string) => {
    setSelected(method);
    onSelect(method);
  };

  return (
    <div className="flex flex-col md:flex-row  gap-4 mt-38  items-center justify-center pb-14 pt-20"> 
      {['Bkash', 'Nagad'].map((method) => (
        <Card
          key={method}
          onClick={() => handleSelect(method)}
          className={`cursor-pointer transition-all duration-300 w-50 h-50 ${
            selected === method ? 'border-2 border-pink-500 shadow-xl' : 'border'
          }`}
        >
          <CardContent className="flex flex-col items-center justify-center p-4">
            <Image
              src={`/images/${method}.png`} // You should place bkash.png and nagad.png in your public/images folder
              alt={`${method} logo`}
              width={80}
              height={80}
            />
            <p className="mt-2 font-semibold text-center capitalize">{method}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
