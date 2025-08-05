'use client';
import AddMoney from "@/components/AddMoney";


export  default function page() {
  return <AddMoney onSelect={(method) => console.log('Selected method:', method)} />;
}
