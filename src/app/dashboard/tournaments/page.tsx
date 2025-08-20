'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Tournament = { 
  id: number; 
  title: string; 
  date: string; 
  entry_fee: number; 
  status: 'upcoming' | 'started' | 'completed';
  match_id?: string;
};

export default function AdminTournamentsPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [formData, setFormData] = useState<Tournament>({
    id: 0,
    title: '',
    date: '',
    entry_fee: 0,
    status: 'upcoming',
    match_id: '',
  });

  // Fetch tournaments from backend
  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tournaments');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load tournaments');
      setTournaments(json.tournaments || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

  // Update tournament
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return toast.error('Title and date are required');

    setSubmitting(true);
    try {
      const url = `/api/tournaments/${formData.id}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Update failed');

      toast.success('Tournament updated successfully');
      setEditDialogOpen(false);
      fetchTournaments();
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete tournament
  const handleDelete = async () => {
    if (!tournamentToDelete) return;
    try {
      const res = await fetch(`/api/tournaments/${tournamentToDelete.id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete failed');

      toast.success('Tournament deleted');
      setDeleteDialogOpen(false);
      setTournamentToDelete(null);
      fetchTournaments();
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  const openEditDialog = (tournament: Tournament) => {
    setFormData({ ...tournament });
    setEditDialogOpen(true);
  };

  const filteredTournaments = tournaments.filter(t => activeTab === 'all' || t.status === activeTab);

  const statusBadge = (status: string) => {
    switch(status){
      case 'upcoming': return <Badge className="bg-blue-500 hover:bg-blue-600">Upcoming</Badge>;
      case 'started': return <Badge className="bg-green-500 hover:bg-green-600">Started</Badge>;
      case 'completed': return <Badge variant="secondary">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Tournaments</h1>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="started">Started</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTournaments.length === 0 ? (
            <Card className="text-center p-12">No tournaments found</Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTournaments.map(t => (
                <Card key={t.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{t.title}</CardTitle>
                      {statusBadge(t.status)}
                    </div>
                    <CardDescription>ID: {t.id} | Match ID: {t.match_id || '-'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span>Date: {new Date(t.date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Entry fee: ${t.entry_fee}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between bg-muted/50 px-6 py-3">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(t)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => { setTournamentToDelete(t); setDeleteDialogOpen(true); }}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Tournament</DialogTitle>
            <DialogDescription>Update tournament details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="grid gap-2">
              <Label>Date & Time</Label>
              <Input type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>
            <div className="grid gap-2">
              <Label>Entry Fee ($)</Label>
              <Input type="number" min="0" step="0.01" value={formData.entry_fee} onChange={e => setFormData({...formData, entry_fee: Number(e.target.value)})} />
            </div>
            <div className="grid gap-2">
              <Label>Match ID</Label>
              <Input placeholder="Match ID" value={formData.match_id} onChange={e => setFormData({...formData, match_id: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={value => setFormData({...formData, status: value as 'upcoming'|'started'|'completed'})}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="started">Started</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin h-4 w-4 mr-1"/>}Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete "{tournamentToDelete?.title}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
