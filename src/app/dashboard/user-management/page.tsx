'use client';
import React, { useState, useEffect } from 'react';

interface User {
  uid: string;
  username: string;
  email: string;
  accountBalance: number;
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedUserId(id);

    // Reset after 2s
    setTimeout(() => setCopiedUserId(null), 2000);
  };

  const filteredUsers = users.filter((user) => {
    const username = user.username?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return username.includes(query) || email.includes(query);
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg overflow-hidden">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">User Management</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by username or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr className="w-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Username</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">User ID</th>
              <th className="py-3 px-6 text-left">Account Balance</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 dark:text-gray-200 text-sm font-light">
            {filteredUsers.map((user) => (
              <tr
                key={user.uid}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <td className="py-3 px-6 text-left whitespace-nowrap">{user.username}</td>
                <td className="py-3 px-6 text-left">{user.email}</td>
                <td className="py-3 px-6 text-left">{user.uid}</td>
                <td className="py-3 px-6 text-left">{user.accountBalance}</td>
                <td className="py-3 px-6 text-center">
                  <button
                    onClick={() => copyToClipboard(user.uid)}
                    className={`${
                      copiedUserId === user.uid
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-indigo-500 hover:bg-indigo-600'
                    } text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150`}
                  >
                    {copiedUserId === user.uid ? 'Copied!' : 'Copy'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;