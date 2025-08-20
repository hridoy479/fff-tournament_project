'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify'; // Import toast
import { auth } from '@/config/firebase'; // Import auth

const AddTournamentPage = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [image, setImage] = useState('');
  const [preview, setPreview] = useState('');
  const [entryFee, setEntryFee] = useState<number>(0);
  const [prize, setPrize] = useState('');
  const [joinedPlayers, setJoinedPlayers] = useState<number>(0);
  const [maxPlayers, setMaxPlayers] = useState<number>(0);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const router = useRouter();

  const resetForm = () => {
    setTitle('');
    setDate('');
    setTime('');
    setImage('');
    setPreview('');
    setEntryFee(0);
    setPrize('');
    setJoinedPlayers(0);
    setMaxPlayers(0);
    setCategory('');
  };

  // Image upload & preview
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    setLoading(true); // Set loading for image upload
    try {
      const currentUser = auth.currentUser; // Get current Firebase user
      if (!currentUser) {
        toast.error('You must be logged in to upload images.');
        setLoading(false);
        return;
      }
      const idToken = await currentUser.getIdToken(); // Get Firebase ID token

      const formData = new FormData();
      formData.append('file', file);

      const { data } = await axios.post('/api/upload', formData, {
        headers: {
          Authorization: `Bearer ${idToken}`, // Add Authorization header
          'Content-Type': 'multipart/form-data', // Important for FormData
        },
      });
      if (data.success) {
        setImage(data.url);
        toast.success('Image uploaded successfully!');
      } else {
        toast.error('Image upload failed.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Upload error.');
      // Handle 401/403 specifically for redirection
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Unauthorized to upload. Please log in as an admin.');
        router.push('/login');
      }
    } finally {
      setLoading(false); // Reset loading
    }
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!title.trim() || !date || !time || !category || !prize.trim() || !image) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true); // Set loading for form submission
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error('You must be logged in as an admin to add tournaments.');
        router.push('/login');
        return;
      }
      const idToken = await currentUser.getIdToken();

      // Correct category format for backend (ensure it matches backend enum 'E Football')
      const formattedCategory = category; // Backend expects 'E Football' as is

      const tournamentDate = `${date}T${time}:00`;
      const payload = {
        title: title.trim(),
        date: tournamentDate,
        image: image.trim(),
        entry_fee: entryFee ? Number(entryFee) : 0,
        prize: prize.trim(),
        joined_players: joinedPlayers ? Number(joinedPlayers) : 0,
        max_players: maxPlayers ? Number(maxPlayers) : 0,
        category: formattedCategory,
        status: 'upcoming', // Default status for new tournaments
      };

      const { data } = await axios.post('/api/admin/tournaments', payload, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (data.ok) { // Backend returns { ok: true, tournament: created }
        toast.success('Tournament added successfully!');
        resetForm(); // Reset form fields
        router.push('/dashboard');
      } else {
        toast.error(`Error: ${data.message || data.error || 'Failed to add tournament.'}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to add tournament.');
      // If token is invalid or not admin, redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Unauthorized access. Please log in as an admin.');
        router.push('/login');
      }
    } finally {
      setLoading(false); // Reset loading
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Tournament</h1>
          <p className="text-gray-600 mt-2">Fill in all details to set up your tournament</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
            <h2 className="text-xl font-bold text-white">Tournament Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tournament Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter tournament name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={loading}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Game Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={loading}
              >
                <option value="">Select a category</option>
                <option value="freefire">Free Fire</option>
                <option value="ludo">Ludo</option>
                <option value="E Football">E Football</option>
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Entry Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fee</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">₹</div>
                <input
                  type="number"
                  value={entryFee}
                  onChange={(e) => setEntryFee(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Prize */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prize <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                placeholder="e.g. ₹5000 Cash Prize"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={loading}
              />
            </div>

            {/* Players */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joined Players</label>
                <input
                  type="number"
                  value={joinedPlayers}
                  onChange={(e) => setJoinedPlayers(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Players</label>
                <input
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tournament Banner</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Paste image URL or upload"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition mb-4"
                disabled={loading}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 text-center transition">
                  Upload Image
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={loading} />
                </label>

                {preview && (
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Preview</div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <img src={preview} alt="Preview" className="w-full h-32 object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition font-medium shadow-md"
                disabled={loading}
                
              >
                {loading ? 'Creating...' : 'Create Tournament'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTournamentPage;