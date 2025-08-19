'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const AddTournamentPage = () => {
  const [game, setGame] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [image, setImage] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [prize, setPrize] = useState('');
  const [joinedPlayers, setJoinedPlayers] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [category, setCategory] = useState('');

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Combine date and time properly
    const tournamentDate = time ? `${date}T${time}:00` : `${date}T00:00:00`;

    const tournamentData = {
      game,
      date: tournamentDate,
      image,
      entry_fee: Number(entryFee),
      prize,
      joined_players: Number(joinedPlayers),
      max_players: Number(maxPlayers),
      category,
    };

    fetch('/api/dashboard/add-tournament', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tournamentData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert('Tournament added successfully!');
          router.push('/dashboard');
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Failed to add tournament. Please try again.');
      });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Tournament</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select a category</option>
            <option value="freefire">Free Fire</option>
            <option value="ludo">Ludo</option>
            <option value="E Football">E Football</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Image URL</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Entry Fee</label>
          <input
            type="number"
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Prize</label>
          <input
            type="text"
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Joined Players</label>
          <input
            type="number"
            value={joinedPlayers}
            onChange={(e) => setJoinedPlayers(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Max Players</label>
          <input
            type="number"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Tournament
        </button>
      </form>
    </div>
  );
};

export default AddTournamentPage;
