// src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

// TypeScript type for your message data
type Message = {
  id: number;
  documentId: string;
  Name: string;
  Email: string;
  Messege: {
    type: string;
    children: {
      type: string;
      text: string;
    }[];
  }[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
};

// Utility to extract message text from Messege array
function getMessageText(messegeArr: Message['Messege']) {
  if (!Array.isArray(messegeArr) || messegeArr.length === 0) return 'No content';
  return messegeArr
    .map(paragraph =>
      Array.isArray(paragraph.children)
        ? paragraph.children.map(child => child.text).join(' ')
        : ''
    )
    .join('\n');
}

export default function AdminDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch messages from Strapi
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:1337/api/messeges');
        setMessages(response.data.data); // Strapi v4: .data.data
      } catch (error) {
        toast.error('Failed to fetch messages.');
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  // Delete a message
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await axios.delete(`http://localhost:1337/api/messeges/${id}`);
        setMessages(prev => prev.filter(msg => msg.id !== id));
        toast.success('Message deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete message.');
        console.error('Error deleting message:', error);
      }
    }
  };



  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Card className="shadow-lg w-full max-w-4xl">
        <CardHeader>
          <CardTitle>
            Messages - {new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka', hour12: true })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-muted-foreground">No messages available.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>{message.id}</TableCell>
                    <TableCell>{message.Name}</TableCell>
                    <TableCell>{message.Email}</TableCell>
                    <TableCell style={{ whiteSpace: 'pre-line' }}>
                      {getMessageText(message.Messege)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(message.id)}
                        className="px-3 py-1"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}