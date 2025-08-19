'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const AddTournamentPage = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [image, setImage] = useState('');
  const [preview, setPreview] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [prize, setPrize] = useState('');
  const [joinedPlayers, setJoinedPlayers] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [category, setCategory] = useState('');

  const router = useRouter();

  // Image upload & preview
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await axios.post('/api/upload', formData);
      if (data.success) setImage(data.url);
      else alert('Image upload failed.');
    } catch (err) {
      console.error(err);
      alert('Upload error.');
    }
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!title.trim() || !date || !time || !category || !prize.trim() || !image) {
      alert('Please fill in all required fields.');
      return;
    }

    // Correct category format for backend
    const formattedCategory = category === 'E Football' ? 'E FootBall' : category;

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
    };

    try {
      const { data } = await axios.post('/api/dashboard/add-tournament', payload);

      if (data.success) {
        alert('Tournament added successfully!');
        router.push('/dashboard');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add tournament.');
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
                  onChange={(e) => setEntryFee(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
              />
            </div>

            {/* Players */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joined Players</label>
                <input
                  type="number"
                  value={joinedPlayers}
                  onChange={(e) => setJoinedPlayers(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Players</label>
                <input
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 text-center transition">
                  Upload Image
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
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
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition font-medium shadow-md"
              >
                Create Tournament
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTournamentPage;
