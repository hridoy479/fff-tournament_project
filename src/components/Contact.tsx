'use client';

import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { FaTelegramPlane, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { db } from '@/config/firebase'; // adjust path
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {Main} from '@/components/Main';
import React, { FormEvent } from 'react';

// Define the form data interface
interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  try {
    await addDoc(collection(db, 'messages'), {
      name: formData.name,
      email: formData.email,
      message: formData.message,
      createdAt: serverTimestamp()
    });

    toast.success('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
  } catch (error: any) {
    toast.error('Failed to send message.');
    console.error('Firestore error:', error.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <Main>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <main className="min-h-screen bg-background px-4 py-20 sm:px-8 flex flex-col items-center text-center mt-16">
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 max-w-2xl"
        >
          <h1 className="text-4xl font-bold mb-4">Let’s Connect!</h1>
          <p className="text-muted-foreground">
            Have a question or collaboration idea? Reach out to us via form or your favorite platform. We’ll respond shortly!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 shadow-md">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Your Message..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Contact Options */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6 space-y-6 shadow-md">
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-4">
                <FaTelegramPlane size={26} className="text-blue-500" />
                <a
                  href="https://t.me/yourchannel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg hover:underline"
                >
                  Join our Telegram
                </a>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-4">
                <FaWhatsapp size={26} className="text-green-500" />
                <a
                  href="https://wa.me/yourwhatsapplink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg hover:underline"
                >
                  Chat on WhatsApp
                </a>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-4">
                <FaEnvelope size={26} className="text-red-500" />
                <a href="mailto:support@example.com" className="text-lg hover:underline">
                  support@example.com
                </a>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </main>
      </Main>
    </>
  );
}