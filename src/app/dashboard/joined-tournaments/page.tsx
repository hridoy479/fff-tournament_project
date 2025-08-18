"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type Joined = {
  tournament_id: number;
  game_name: string;
  entry_fee: number;
  title: string;
  date: string;
  status: "upcoming" | "started" | "completed";
};

export default function JoinedTournamentsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Joined[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/dashboard/joined', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load');
        setItems(json.items || []);
      } catch {}
      finally { setLoading(false); }
    };
    run();
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Joined Tournaments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : !user ? (
            <p>Please log in to view your joined tournaments.</p>
          ) : items.length === 0 ? (
            <p>No tournaments joined yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Entry Fee</TableHead>
                  <TableHead>Game Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={`${it.tournament_id}-${it.game_name}`}>
                    <TableCell>{it.title}</TableCell>
                    <TableCell>{it.entry_fee}</TableCell>
                    <TableCell>{it.game_name}</TableCell>
                    <TableCell>{new Date(it.date).toDateString()}</TableCell>
                    <TableCell className="capitalize">{it.status}</TableCell>
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


