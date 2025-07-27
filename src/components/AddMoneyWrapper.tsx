'use client';

import dynamic from 'next/dynamic';

const AddMoney = dynamic(() => import('./AddMoney'), { ssr: false });

export default function AddMoneyWrapper() {
  return <AddMoney />;
}
