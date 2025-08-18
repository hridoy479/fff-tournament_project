"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

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
      const res = await fetch("/api/user/balance", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = await res.text();
      let json: any;
      try { json = JSON.parse(raw); } catch { throw new Error(raw || "Failed to check balance"); }
      if (!res.ok) throw new Error(json.error || "Failed to check balance");
      if ((json.balance ?? 0) < entryFee) {
        setInsufficient(true);
        return;
      }
      setOpen(true);
    } catch (e: any) {
      const msg = e?.message || "Unable to check balance";
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
      const res = await fetch("/api/tournaments/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tournamentId, gameName, entryFee }),
      });
      const raw = await res.text();
      let json: any;
      try { json = JSON.parse(raw); } catch { throw new Error(raw || "Join failed"); }
      if (!res.ok) throw new Error(json.error || "Join failed");
      if (json.insufficient) {
        setOpen(false);
        setInsufficient(true);
        return;
      }
      toast.success("Joined successfully");
      setOpen(false);
    } catch (e: any) {
      const msg = e?.message || "Failed to join";
      toast.error(msg);
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


