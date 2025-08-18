"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// using native select to avoid missing shadcn Select in this project
import toast from 'react-hot-toast';

type Tournament = { id: number; title: string; date: string; entry_fee: number; status: string };

export default function AdminTournamentsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [entryFee, setEntryFee] = useState<number>(0);
  const [status, setStatus] = useState<'upcoming' | 'started' | 'completed'>('upcoming');
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/tournaments', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load tournaments');
      setItems(json.tournaments || []);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [user]);

  const addTournament = async () => {
    if (!user) return;
    if (!title || !date) { toast.error('Title and date are required'); return; }
    try {
      setSubmitting(true);
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, date, entry_fee: entryFee, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Create failed');
      toast.success('Tournament created');
      setTitle(''); setDate(''); setEntryFee(0); setStatus('upcoming');
      fetchAll();
    } catch (e: any) {
      toast.error(e?.message || 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  const removeTournament = async (id: number) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/tournaments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete failed');
      toast.success('Deleted');
      fetchAll();
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Tournament</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input type="number" placeholder="Entry Fee" value={entryFee} onChange={(e) => setEntryFee(Number(e.target.value || 0))} />
          <select className="border rounded h-10 px-3" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="upcoming">Upcoming</option>
            <option value="started">Started</option>
            <option value="completed">Completed</option>
          </select>
          <div className="sm:col-span-2 lg:col-span-5">
            <Button onClick={addTournament} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tournaments</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {loading ? 'Loading...' : (
            items.length === 0 ? (
              <p>No tournaments yet</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((t) => (
                  <div key={t.id} className="border rounded p-3 space-y-2">
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-sm text-muted-foreground">{new Date(t.date).toLocaleString()}</div>
                    <div className="text-sm">Entry Fee: {t.entry_fee}</div>
                    <div className="text-sm capitalize">Status: {t.status}</div>
                    <Button variant="destructive" onClick={() => removeTournament(t.id)}>Delete</Button>
                  </div>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}


