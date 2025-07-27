import React, { JSX } from 'react';
import Dashboard from '@/components/Dashboard';
import { Main } from '@/components/Main';
import { Login } from '@/components/Login';

// If using a layout or wrapper like Main, import it
// import Main from '@/components/Main'; 
// Otherwise use a <div> or your preferred wrapper
export const metadata = {
  title: 'Dashboard',
  description: 'User Dashboard',
};
export default function DashboardPage(): JSX.Element {
  const isAuthenticated: boolean = true; // Replace with real auth logic

  let children= (<Login />);
  if (isAuthenticated) {
    children = <Dashboard />;
  }


  return (
    <Main>
      <div className=''>
        {children}
      </div>
    </Main>
  );
}
