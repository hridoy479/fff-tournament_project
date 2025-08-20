"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify"; // Keep react-hot-toast for now
import axios from "axios"; // Import axios

interface JoinTournamentProps {
  tournamentId: number;
  entryFee: number;
}

export default function JoinTournament({ tournamentId, entryFee }: JoinTournamentProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [gameName, setGameName] = useState("");
  const [loading, setLoading] = useState(false);
  const [insufficient, setInsufficient] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkAndOpen = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    try {
      setChecking(true);
      const token = await user.getIdToken();
      // Change to /api/user/profile
      const res = await axios.get("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const userProfile = res.data; // Assuming res.data contains the user profile
      if ((userProfile.accountBalance ?? 0) < entryFee) { // Check accountBalance
        setInsufficient(true);
        return;
      }
      setOpen(true);
    } catch (e: any) {
      console.error("Error checking balance:", e);
      const msg = e.response?.data?.message || "Unable to check balance";
      toast.error(msg);
    } finally {
      setChecking(false);
    }
  };

  const submitJoin = async () => {
    if (!user) return;
    if (!gameName.trim()) {
      toast.error("Please enter your in-game name");
      return;
    }
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const res = await axios.post("/api/tournaments/join", {
        tournament_id: tournamentId, // Use tournament_id
        game_name: gameName, // Use game_name
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Backend returns { message: 'Successfully joined tournament', player: newPlayer }
      toast.success(res.data.message || "Joined successfully");
      setOpen(false);
    } catch (e: any) {
      console.error("Error joining tournament:", e);
      const msg = e.response?.data?.message || "Failed to join";
      toast.error(msg);
      // If the backend indicates insufficient balance, show the alert
      if (e.response?.status === 402) { // 402 Payment Required for insufficient balance
        setOpen(false);
        setInsufficient(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {insufficient && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Insufficient Balance</AlertTitle>
          <AlertDescription>
            You don't have enough money. Add money {" "}
            <Link href="/add-money" className="underline font-medium">Click Here</Link>
          </AlertDescription>
        </Alert>
      )}

      <Button className="w-full" onClick={checkAndOpen} disabled={checking}>
        {checking ? "Checking..." : "Join Now"}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter your in-game name</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Game name"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Entry fee: {entryFee}</p>
          </div>
          <AlertDialogFooter>
            <Button onClick={() => setOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={submitJoin} disabled={loading}>{loading ? "Joining..." : "Confirm"}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}