"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Trophy, Users, CreditCard, Clock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Joined = {
  tournament_id: number;
  game_name: string;
  entry_fee: number;
  title: string;
  date: string;
  status: "upcoming" | "started" | "completed";
  prize_pool?: number;
  participants?: number;
};

export default function JoinedTournamentsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Joined[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) { 
        setLoading(false); 
        return; 
      }
      
      try {
        setLoading(true);
        setError(null);
        const token = await user.firebaseUser.getIdToken();
        const res = await fetch('/api/dashboard/joined', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load tournaments');
        setItems(json.joinedTournaments || []);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading tournaments');
      } finally { 
        setLoading(false); 
      }
    };
    
    fetchData();
  }, [user]);

  // Filter tournaments by status for tabs
  const upcomingTournaments = items.filter(item => item.status === "upcoming");
  const activeTournaments = items.filter(item => item.status === "started");
  const completedTournaments = items.filter(item => item.status === "completed");

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "upcoming": return "secondary";
      case "started": return "default";
      case "completed": return "outline";
      default: return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-4 pt-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tournaments</h1>
          <p className="text-muted-foreground">
            Manage and track all tournaments you've joined
          </p>
        </div>
        <Button className="hidden md:flex">
          <Trophy className="mr-2 h-4 w-4" /> Join New Tournament
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!user && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">
                Please log in to view your joined tournaments
              </p>
              <Button>Sign In</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {user && (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Tournaments</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <TournamentTable 
              items={items} 
              loading={loading} 
              getStatusVariant={getStatusVariant}
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-4">
            <TournamentTable 
              items={upcomingTournaments} 
              loading={loading} 
              getStatusVariant={getStatusVariant}
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            <TournamentTable 
              items={activeTournaments} 
              loading={loading} 
              getStatusVariant={getStatusVariant}
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            <TournamentTable 
              items={completedTournaments} 
              loading={loading} 
              getStatusVariant={getStatusVariant}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function TournamentTable({ items, loading, getStatusVariant, formatDate }: { 
  items: Joined[], 
  loading: boolean, 
  getStatusVariant: (status: string) => any,
  formatDate: (date: string) => string 
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tournaments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tournaments found</h3>
            <p className="text-muted-foreground mb-4">
              You haven't joined any tournaments in this category yet
            </p>
            <Button>
              <Trophy className="mr-2 h-4 w-4" /> Browse Tournaments
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tournaments</CardTitle>
        <CardDescription>
          You've joined {items.length} tournament{items.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tournament</TableHead>
              <TableHead>Game</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead className="text-right">Entry Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((tournament) => (
              <TableRow key={`${tournament.tournament_id}-${tournament.game_name}`} className="group">
                <TableCell className="font-medium">{tournament.title}</TableCell>
                <TableCell>{tournament.game_name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 opacity-70" />
                    {formatDate(tournament.date)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    <CreditCard className="mr-1 h-4 w-4 opacity-70" />
                    ${tournament.entry_fee}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(tournament.status)} className="capitalize">
                    {tournament.status === "upcoming" && <Clock className="mr-1 h-3 w-3" />}
                    {tournament.status === "started" && <Users className="mr-1 h-3 w-3" />}
                    {tournament.status === "completed" && <Trophy className="mr-1 h-3 w-3" />}
                    {tournament.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}